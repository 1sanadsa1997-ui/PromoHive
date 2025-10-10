import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import authUtils from "../lib/auth";
import { sendEmail } from "../lib/mailer";
import QRCode from "qrcode";
import speakeasy from "speakeasy";

const router = Router();
const prisma = new PrismaClient();

// ===== TYPES =====
interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
  twoFactorCode?: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phone?: string;
  country?: string;
  phoneCode?: string;
  referredBy?: string;
  termsAccepted: boolean;
  privacyAccepted: boolean;
}

interface AuthResponse {
  user: any;
  token: string;
  expiresIn: number;
}

interface TwoFactorSetup {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

enum UserStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  SUSPENDED = "SUSPENDED",
  BANNED = "BANNED"
}

// ===== VALIDATION SCHEMAS =====
const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
  twoFactorCode: z.string().optional(),
});

const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
  country: z.string().optional(),
  phoneCode: z.string().optional(),
  referredBy: z.string().optional(),
  termsAccepted: z.boolean().refine(val => val === true, "Terms must be accepted"),
  privacyAccepted: z.boolean().refine(val => val === true, "Privacy policy must be accepted"),
});

const passwordResetSchema = z.object({
  email: z.string().email("Invalid email format"),
});

const passwordResetConfirmSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// ===== REGISTRATION =====
router.post("/register", async (req: Request, res: Response) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const { email, password, name, phone, country, phoneCode, referredBy, termsAccepted, privacyAccepted } = validatedData;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "Email already registered",
      });
    }

    // Validate password strength
    const passwordValidation = authUtils.validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({
        success: false,
        error: "Password validation failed",
        errors: passwordValidation.errors,
      });
    }

    // Check for disposable email
    if (authUtils.isDisposableEmail(email)) {
      return res.status(400).json({
        success: false,
        error: "Disposable email addresses are not allowed",
      });
    }

    // Validate phone if provided
    if (phone && !authUtils.validatePhone(phone)) {
      return res.status(400).json({
        success: false,
        error: "Invalid phone number format",
      });
    }

    // Hash password
    const passwordHash = await authUtils.hashPassword(password);

    // Generate referral code
    const referralCode = authUtils.generateSecureCode(8).toUpperCase();

    // Check if referredBy is valid
    let referrerId: string | undefined;
    if (referredBy) {
      const referrer = await prisma.user.findUnique({
        where: { referralCode: referredBy },
      });
      if (referrer) {
        referrerId = referrer.id;
      }
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        name: authUtils.sanitizeInput(name),
        phone: phone ? authUtils.sanitizeInput(phone) : undefined,
        country: country ? authUtils.sanitizeInput(country) : undefined,
        phoneCode: phoneCode || (country ? authUtils.getCountryPhoneCode(country) : undefined),
        referralCode,
        referredBy: referrerId,
        status: UserStatus.PENDING, // Requires admin approval
        language: "en",
        notificationPrefs: {
          email: true,
          sms: false,
          push: true,
          inApp: true,
        },
        privacySettings: {
          profileVisibility: "public",
          dataSharing: false,
          analytics: true,
        },
      },
    });

    // Create referral if applicable
    if (referrerId) {
      await prisma.referral.create({
        data: {
          referrerId,
          refereeId: user.id,
          reward: parseFloat(process.env.REFERRAL_BONUS_AMOUNT || "5.00"),
          status: "PENDING",
        },
      });
    }

    // Log audit event
    await authUtils.logAuditEvent(
      user.id,
      "USER",
      "USER_REGISTERED",
      "User",
      user.id,
      { email: user.email, country: user.country },
      req
    );

    // Send welcome email
    try {
      await sendEmail({
        to: user.email,
        subject: "Welcome to PromoHive Global Promo Network!",
        html: `
          <h1>Welcome to PromoHive!</h1>
          <p>Hi ${user.name},</p>
          <p>Thank you for registering with PromoHive Global Promo Network. Your account is pending approval.</p>
          <p>Once approved, you'll be able to:</p>
          <ul>
            <li>Complete tasks and earn rewards</li>
            <li>Refer friends and earn bonuses</li>
            <li>Upgrade your level for better opportunities</li>
            <li>Withdraw your earnings</li>
          </ul>
          <p>We'll notify you once your account is approved.</p>
          <p>Best regards,<br>The PromoHive Team</p>
        `,
      });
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
    }

    res.status(201).json({
      success: true,
      message: "Registration successful. Account pending approval.",
      data: {
        userId: user.id,
        email: user.email,
        status: user.status,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        errors: error.errors.reduce((acc, err) => {
          acc[err.path.join(".")] = err.message;
          return acc;
        }, {} as Record<string, string>),
      });
    }

    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// ===== LOGIN =====
router.post("/login", async (req: Request, res: Response) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const { email, password, rememberMe, twoFactorCode } = validatedData;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    // Check account lockout
    const isLocked = await authUtils.checkAccountLockout(user.id);
    if (isLocked) {
      return res.status(423).json({
        success: false,
        error: "Account temporarily locked due to too many failed login attempts",
      });
    }

    // Check account status
    if (user.status === UserStatus.SUSPENDED || user.status === UserStatus.BANNED) {
      await authUtils.logLoginAttempt(user.id, false, req);
      return res.status(403).json({
        success: false,
        error: "Account suspended or banned",
      });
    }

    if (user.status === UserStatus.PENDING) {
      return res.status(403).json({
        success: false,
        error: "Account pending approval",
      });
    }

    // Verify password
    const passwordValid = await authUtils.comparePassword(password, user.passwordHash);
    if (!passwordValid) {
      await authUtils.handleFailedLogin(user.id);
      await authUtils.logLoginAttempt(user.id, false, req);
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    // Check 2FA if enabled
    if (user.twoFactorEnabled) {
      if (!twoFactorCode) {
        return res.status(200).json({
          success: true,
          requiresTwoFactor: true,
          message: "Two-factor authentication required",
        });
      }

      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret!,
        encoding: "base32",
        token: twoFactorCode,
        window: 2,
      });

      if (!verified) {
        await authUtils.handleFailedLogin(user.id);
        await authUtils.logLoginAttempt(user.id, false, req);
        return res.status(401).json({
          success: false,
          error: "Invalid two-factor authentication code",
        });
      }
    }

    // Reset login attempts on successful login
    await authUtils.resetLoginAttempts(user.id);

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Create session
    const token = await authUtils.createSession(user.id, req);

    // Log successful login
    await authUtils.logLoginAttempt(user.id, true, req);

    // Log audit event
    await authUtils.logAuditEvent(
      user.id,
      "USER",
      "USER_LOGIN",
      "User",
      user.id,
      { ipAddress: req.ip, userAgent: req.get("User-Agent") },
      req
    );

    const response: AuthResponse = {
      user: user as User,
      token,
      expiresIn: rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60, // 30 days or 7 days
    };

    res.json({
      success: true,
      data: response,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        errors: error.errors.reduce((acc, err) => {
          acc[err.path.join(".")] = err.message;
          return acc;
        }, {} as Record<string, string>),
      });
    }

    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// ===== PASSWORD RESET REQUEST =====
router.post("/forgot-password", async (req: Request, res: Response) => {
  try {
    const validatedData = passwordResetSchema.parse(req.body);
    const { email } = validatedData;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({
        success: true,
        message: "If the email exists, a password reset link has been sent",
      });
    }

    // Generate reset token
    const resetToken = authUtils.generateSecureCode(32);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store reset token (you might want to create a separate table for this)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        // Store reset token in a temporary field or separate table
        metadata: {
          ...(user.metadata as any || {}),
          passwordResetToken: resetToken,
          passwordResetExpires: expiresAt.toISOString(),
        },
      },
    });

    // Send reset email
    try {
      await sendEmail({
        to: user.email,
        subject: "Password Reset Request - PromoHive",
        html: `
          <h1>Password Reset Request</h1>
          <p>Hi ${user.name},</p>
          <p>You requested a password reset for your PromoHive account.</p>
          <p>Click the link below to reset your password:</p>
          <a href="${process.env.FRONTEND_URL}/reset-password?token=${resetToken}" 
             style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Reset Password
          </a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this reset, please ignore this email.</p>
          <p>Best regards,<br>The PromoHive Team</p>
        `,
      });
    } catch (emailError) {
      console.error("Failed to send password reset email:", emailError);
    }

    res.json({
      success: true,
      message: "If the email exists, a password reset link has been sent",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        errors: error.errors.reduce((acc, err) => {
          acc[err.path.join(".")] = err.message;
          return acc;
        }, {} as Record<string, string>),
      });
    }

    console.error("Password reset request error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// ===== PASSWORD RESET CONFIRM =====
router.post("/reset-password", async (req: Request, res: Response) => {
  try {
    const validatedData = passwordResetConfirmSchema.parse(req.body);
    const { token, password } = validatedData;

    // Find user with valid reset token
    const user = await prisma.user.findFirst({
      where: {
        metadata: {
          path: ["passwordResetToken"],
          equals: token,
        },
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: "Invalid or expired reset token",
      });
    }

    const metadata = user.metadata as any;
    const resetExpires = new Date(metadata.passwordResetExpires);

    if (resetExpires < new Date()) {
      return res.status(400).json({
        success: false,
        error: "Reset token has expired",
      });
    }

    // Validate new password
    const passwordValidation = authUtils.validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({
        success: false,
        error: "Password validation failed",
        errors: passwordValidation.errors,
      });
    }

    // Hash new password
    const passwordHash = await authUtils.hashPassword(password);

    // Update user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordChangedAt: new Date(),
        metadata: {
          ...metadata,
          passwordResetToken: undefined,
          passwordResetExpires: undefined,
        },
      },
    });

    // Revoke all sessions
    await authUtils.revokeAllUserSessions(user.id);

    // Log audit event
    await authUtils.logAuditEvent(
      user.id,
      "USER",
      "PASSWORD_RESET",
      "User",
      user.id,
      { ipAddress: req.ip },
      req
    );

    res.json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        errors: error.errors.reduce((acc, err) => {
          acc[err.path.join(".")] = err.message;
          return acc;
        }, {} as Record<string, string>),
      });
    }

    console.error("Password reset confirm error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// ===== TWO FACTOR AUTHENTICATION SETUP =====
router.post("/setup-2fa", authUtils.authenticateUser, async (req: any, res: Response) => {
  try {
    const user = req.user;

    if (user.twoFactorEnabled) {
      return res.status(400).json({
        success: false,
        error: "Two-factor authentication is already enabled",
      });
    }

    // Generate secret
    const secret = authUtils.generateTwoFactorSecret();
    const qrCodeUrl = authUtils.generateQRCode(secret, user.email);

    // Generate QR code
    const qrCode = await QRCode.toDataURL(qrCodeUrl);

    // Generate backup codes
    const backupCodes = authUtils.generateBackupCodes();

    // Store secret temporarily (user needs to verify before enabling)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        metadata: {
          ...(user.metadata as any || {}),
          twoFactorSecretTemp: secret,
          twoFactorBackupCodes: backupCodes,
        },
      },
    });

    const response: TwoFactorSetup = {
      secret,
      qrCode,
      backupCodes,
    };

    res.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("2FA setup error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// ===== VERIFY TWO FACTOR AUTHENTICATION =====
router.post("/verify-2fa", authUtils.authenticateUser, async (req: any, res: Response) => {
  try {
    const { code } = req.body;
    const user = req.user;

    if (!code) {
      return res.status(400).json({
        success: false,
        error: "Verification code is required",
      });
    }

    const metadata = user.metadata as any;
    const tempSecret = metadata.twoFactorSecretTemp;

    if (!tempSecret) {
      return res.status(400).json({
        success: false,
        error: "No pending 2FA setup found",
      });
    }

    // Verify code
    const verified = speakeasy.totp.verify({
      secret: tempSecret,
      encoding: "base32",
      token: code,
      window: 2,
    });

    if (!verified) {
      return res.status(400).json({
        success: false,
        error: "Invalid verification code",
      });
    }

    // Enable 2FA
    await prisma.user.update({
      where: { id: user.id },
      data: {
        twoFactorEnabled: true,
        twoFactorSecret: tempSecret,
        metadata: {
          ...metadata,
          twoFactorSecretTemp: undefined,
        },
      },
    });

    // Log audit event
    await authUtils.logAuditEvent(
      user.id,
      "USER",
      "2FA_ENABLED",
      "User",
      user.id,
      { ipAddress: req.ip },
      req
    );

    res.json({
      success: true,
      message: "Two-factor authentication enabled successfully",
    });
  } catch (error) {
    console.error("2FA verification error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// ===== DISABLE TWO FACTOR AUTHENTICATION =====
router.post("/disable-2fa", authUtils.authenticateUser, async (req: any, res: Response) => {
  try {
    const { code } = req.body;
    const user = req.user;

    if (!user.twoFactorEnabled) {
      return res.status(400).json({
        success: false,
        error: "Two-factor authentication is not enabled",
      });
    }

    if (!code) {
      return res.status(400).json({
        success: false,
        error: "Verification code is required",
      });
    }

    // Verify code
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret!,
      encoding: "base32",
      token: code,
      window: 2,
    });

    if (!verified) {
      return res.status(400).json({
        success: false,
        error: "Invalid verification code",
      });
    }

    // Disable 2FA
    await prisma.user.update({
      where: { id: user.id },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
      },
    });

    // Log audit event
    await authUtils.logAuditEvent(
      user.id,
      "USER",
      "2FA_DISABLED",
      "User",
      user.id,
      { ipAddress: req.ip },
      req
    );

    res.json({
      success: true,
      message: "Two-factor authentication disabled successfully",
    });
  } catch (error) {
    console.error("2FA disable error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// ===== LOGOUT =====
router.post("/logout", authUtils.authenticateUser, async (req: any, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.substring(7);

    if (token) {
      await authUtils.revokeSession(token);
    }

    // Log audit event
    await authUtils.logAuditEvent(
      req.user.id,
      "USER",
      "USER_LOGOUT",
      "User",
      req.user.id,
      { ipAddress: req.ip },
      req
    );

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// ===== REFRESH TOKEN =====
router.post("/refresh", async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: "Refresh token is required",
      });
    }

    const decoded = authUtils.verifyToken(refreshToken);
    
    if (decoded.type !== "refresh") {
      return res.status(401).json({
        success: false,
        error: "Invalid refresh token",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "User not found",
      });
    }

    // Generate new access token
    const newToken = authUtils.generateToken({ userId: user.id, type: "access" });

    res.json({
      success: true,
      data: {
        token: newToken,
        expiresIn: 7 * 24 * 60 * 60, // 7 days
      },
    });
  } catch (error) {
    console.error("Token refresh error:", error);
    res.status(401).json({
      success: false,
      error: "Invalid refresh token",
    });
  }
});

// ===== GET CURRENT USER =====
router.get("/me", authUtils.authenticateUser, async (req: any, res: Response) => {
  try {
    const user = req.user;

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

export default router;