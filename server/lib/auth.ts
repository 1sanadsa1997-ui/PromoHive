import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ===== TYPES =====
interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
  status: string;
  level: number;
  balance: number;
  [key: string]: any;
}

interface Admin {
  id: string;
  email: string;
  name?: string;
  role: string;
  [key: string]: any;
}

enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
  SUPER_ADMIN = "SUPER_ADMIN"
}

enum AdminRole {
  ADMIN = "ADMIN",
  SUPER_ADMIN = "SUPER_ADMIN",
  MODERATOR = "MODERATOR"
}

// ===== JWT UTILITIES =====
export const generateToken = (payload: any, expiresIn: string = "7d"): string => {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn });
};

export const verifyToken = (token: string): any => {
  return jwt.verify(token, process.env.JWT_SECRET!);
};

export const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ userId, type: "refresh" }, process.env.JWT_SECRET!, { expiresIn: "30d" });
};

// ===== PASSWORD UTILITIES =====
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || "12");
  return bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

// ===== AUTHENTICATION MIDDLEWARE =====
export interface AuthenticatedRequest extends Request {
  user?: User;
  admin?: Admin;
}

export const authenticateUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ success: false, error: "No token provided" });
      return;
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (decoded.type === "refresh") {
      res.status(401).json({ success: false, error: "Invalid token type" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        submissions: true,
        transactions: true,
        withdrawals: true,
        achievements: true,
        notifications: true,
        referralsMade: true,
        referralsGot: true,
      },
    });

    if (!user) {
      res.status(401).json({ success: false, error: "User not found" });
      return;
    }

    if (user.status === "SUSPENDED" || user.status === "BANNED") {
      res.status(403).json({ success: false, error: "Account suspended or banned" });
      return;
    }

    req.user = user as User;
    next();
  } catch (error) {
    res.status(401).json({ success: false, error: "Invalid token" });
  }
};

export const authenticateAdmin = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const adminPassword = req.headers["x-admin-password"] as string;

    // Check for admin password header (for development)
    if (adminPassword && adminPassword === process.env.ADMIN_PASSWORD) {
      const admin = await prisma.admin.findFirst({
        where: { email: process.env.ADMIN_EMAIL },
      });
      if (admin) {
        req.admin = admin as Admin;
        next();
        return;
      }
    }

    // Check for JWT token
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ success: false, error: "No admin token provided" });
      return;
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (decoded.type === "refresh") {
      res.status(401).json({ success: false, error: "Invalid token type" });
      return;
    }

    const admin = await prisma.admin.findUnique({
      where: { id: decoded.adminId },
    });

    if (!admin) {
      res.status(401).json({ success: false, error: "Admin not found" });
      return;
    }

    req.admin = admin as Admin;
    next();
  } catch (error) {
    res.status(401).json({ success: false, error: "Invalid admin token" });
  }
};

// ===== AUTHORIZATION MIDDLEWARE =====
export const requireRole = (roles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: "Authentication required" });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ success: false, error: "Insufficient permissions" });
      return;
    }

    next();
  };
};

export const requireAdminRole = (roles: AdminRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.admin) {
      res.status(401).json({ success: false, error: "Admin authentication required" });
      return;
    }

    if (!roles.includes(req.admin.role)) {
      res.status(403).json({ success: false, error: "Insufficient admin permissions" });
      return;
    }

    next();
  };
};

export const requireLevel = (minLevel: number) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: "Authentication required" });
      return;
    }

    if (req.user.level < minLevel) {
      res.status(403).json({ 
        success: false, 
        error: `Level ${minLevel} required. Current level: ${req.user.level}` 
      });
      return;
    }

    next();
  };
};

// ===== RATE LIMITING =====
export const rateLimit = (maxRequests: number = 100, windowMs: number = 900000) => {
  const requests = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.connection.remoteAddress || "unknown";
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean up old entries
    for (const [key, value] of requests.entries()) {
      if (value.resetTime < windowStart) {
        requests.delete(key);
      }
    }

    const userRequests = requests.get(ip);
    
    if (!userRequests) {
      requests.set(ip, { count: 1, resetTime: now });
      next();
      return;
    }

    if (userRequests.resetTime < windowStart) {
      requests.set(ip, { count: 1, resetTime: now });
      next();
      return;
    }

    if (userRequests.count >= maxRequests) {
      res.status(429).json({ 
        success: false, 
        error: "Too many requests, please try again later" 
      });
      return;
    }

    userRequests.count++;
    next();
  };
};

// ===== INPUT VALIDATION =====
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  
  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  return { valid: errors.length === 0, errors };
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
};

// ===== SECURITY UTILITIES =====
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .replace(/['"]/g, "") // Remove quotes
    .trim();
};

export const generateSecureCode = (length: number = 6): string => {
  const chars = "0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const generateBackupCodes = (count: number = 10): string[] => {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    codes.push(generateSecureCode(8));
  }
  return codes;
};

// ===== SESSION MANAGEMENT =====
export const createSession = async (userId: string, req: Request): Promise<string> => {
  const token = generateToken({ userId, type: "access" });
  
  await prisma.session.create({
    data: {
      userId,
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get("User-Agent"),
    },
  });

  return token;
};

export const revokeSession = async (token: string): Promise<void> => {
  await prisma.session.deleteMany({
    where: { token },
  });
};

export const revokeAllUserSessions = async (userId: string): Promise<void> => {
  await prisma.session.deleteMany({
    where: { userId },
  });
};

// ===== AUDIT LOGGING =====
export const logAuditEvent = async (
  actorId: string | null,
  actorType: "USER" | "ADMIN" | "SYSTEM",
  action: string,
  resource?: string,
  resourceId?: string,
  metadata?: Record<string, any>,
  req?: Request
): Promise<void> => {
  try {
    await prisma.auditLog.create({
      data: {
        actorId,
        actorType,
        action,
        resource,
        resourceId,
        metadata,
        ipAddress: req?.ip || req?.connection.remoteAddress,
        userAgent: req?.get("User-Agent"),
      },
    });
  } catch (error) {
    console.error("Failed to log audit event:", error);
  }
};

// ===== LOGIN HISTORY =====
export const logLoginAttempt = async (
  userId: string,
  success: boolean,
  req: Request
): Promise<void> => {
  try {
    await prisma.loginHistory.create({
      data: {
        userId,
        success,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get("User-Agent"),
        location: req.get("X-Forwarded-For") || req.ip,
      },
    });
  } catch (error) {
    console.error("Failed to log login attempt:", error);
  }
};

// ===== ACCOUNT LOCKOUT =====
export const checkAccountLockout = async (userId: string): Promise<boolean> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { lockedUntil: true, loginAttempts: true },
  });

  if (!user) return false;

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    return true; // Account is locked
  }

  return false;
};

export const handleFailedLogin = async (userId: string): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { loginAttempts: true },
  });

  if (!user) return;

  const newAttempts = user.loginAttempts + 1;
  const lockUntil = newAttempts >= 5 ? new Date(Date.now() + 30 * 60 * 1000) : null; // 30 minutes

  await prisma.user.update({
    where: { id: userId },
    data: {
      loginAttempts: newAttempts,
      lockedUntil: lockUntil,
    },
  });
};

export const resetLoginAttempts = async (userId: string): Promise<void> => {
  await prisma.user.update({
    where: { id: userId },
    data: {
      loginAttempts: 0,
      lockedUntil: null,
    },
  });
};

// ===== TWO FACTOR AUTHENTICATION =====
export const generateTwoFactorSecret = (): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let secret = "";
  for (let i = 0; i < 32; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return secret;
};

export const generateQRCode = (secret: string, email: string): string => {
  const issuer = "PromoHive";
  const accountName = email;
  const otpauth = `otpauth://totp/${issuer}:${accountName}?secret=${secret}&issuer=${issuer}`;
  return otpauth;
};

// ===== DISPOSABLE EMAIL DETECTION =====
const disposableEmailDomains = [
  "10minutemail.com",
  "tempmail.org",
  "guerrillamail.com",
  "mailinator.com",
  "throwaway.email",
  // Add more domains as needed
];

export const isDisposableEmail = (email: string): boolean => {
  const domain = email.split("@")[1]?.toLowerCase();
  return disposableEmailDomains.includes(domain || "");
};

// ===== COUNTRY CODE UTILITIES =====
export const getCountryPhoneCode = (country: string): string => {
  const countryCodes: Record<string, string> = {
    US: "+1",
    CA: "+1",
    GB: "+44",
    AU: "+61",
    DE: "+49",
    FR: "+33",
    IT: "+39",
    ES: "+34",
    JP: "+81",
    KR: "+82",
    CN: "+86",
    IN: "+91",
    BR: "+55",
    MX: "+52",
    RU: "+7",
    // Add more as needed
  };
  
  return countryCodes[country] || "+1";
};

export default {
  generateToken,
  verifyToken,
  generateRefreshToken,
  hashPassword,
  comparePassword,
  authenticateUser,
  authenticateAdmin,
  requireRole,
  requireAdminRole,
  requireLevel,
  rateLimit,
  validateEmail,
  validatePassword,
  validatePhone,
  sanitizeInput,
  generateSecureCode,
  generateBackupCodes,
  createSession,
  revokeSession,
  revokeAllUserSessions,
  logAuditEvent,
  logLoginAttempt,
  checkAccountLockout,
  handleFailedLogin,
  resetLoginAttempts,
  generateTwoFactorSecret,
  generateQRCode,
  isDisposableEmail,
  getCountryPhoneCode,
};
