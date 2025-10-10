import nodemailer from "nodemailer";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ===== EMAIL CONFIGURATION =====
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST || "smtp.hostinger.com",
  port: parseInt(process.env.SMTP_PORT || "465"),
  secure: process.env.SMTP_SECURE === "true" || process.env.SMTP_PORT === "465", // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ===== EMAIL INTERFACES =====
export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

// ===== EMAIL TEMPLATES =====
const emailTemplates: Record<string, EmailTemplate> = {
  welcome: {
    subject: "Welcome to PromoHive Global Promo Network!",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to PromoHive</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to PromoHive!</h1>
            <p>Your journey to earning rewards starts now</p>
          </div>
          <div class="content">
            <h2>Hi {{name}},</h2>
            <p>Thank you for joining PromoHive Global Promo Network! We're excited to have you on board.</p>
            
            <h3>What's Next?</h3>
            <ul>
              <li>✅ Complete tasks and earn rewards</li>
              <li>🎁 Refer friends and earn bonuses</li>
              <li>📈 Upgrade your level for better opportunities</li>
              <li>💰 Withdraw your earnings</li>
            </ul>
            
            <p>Your account is currently pending approval. Once approved, you'll receive a $5 welcome bonus!</p>
            
            <a href="{{loginUrl}}" class="button">Login to Your Account</a>
            
            <h3>Need Help?</h3>
            <p>If you have any questions, feel free to contact our support team:</p>
            <ul>
              <li>📧 Email: support@promohive.com</li>
              <li>💬 WhatsApp: <a href="https://wa.me/17253348692">+1 (725) 334-8692</a></li>
            </ul>
          </div>
          <div class="footer">
            <p>Best regards,<br>The PromoHive Team</p>
            <p>© 2024 PromoHive Global Promo Network. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Welcome to PromoHive Global Promo Network!
      
      Hi {{name}},
      
      Thank you for joining PromoHive Global Promo Network! We're excited to have you on board.
      
      What's Next?
      - Complete tasks and earn rewards
      - Refer friends and earn bonuses
      - Upgrade your level for better opportunities
      - Withdraw your earnings
      
      Your account is currently pending approval. Once approved, you'll receive a $5 welcome bonus!
      
      Login to your account: {{loginUrl}}
      
      Need Help?
      If you have any questions, feel free to contact our support team:
      - Email: support@promohive.com
      - WhatsApp: +1 (725) 334-8692
      
      Best regards,
      The PromoHive Team
      
      © 2024 PromoHive Global Promo Network. All rights reserved.
    `,
  },
  
  accountApproved: {
    subject: "🎉 Your PromoHive Account Has Been Approved!",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Approved - PromoHive</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .bonus-box { background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .button { display: inline-block; background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Account Approved!</h1>
            <p>You're ready to start earning!</p>
          </div>
          <div class="content">
            <h2>Congratulations {{name}}!</h2>
            <p>Great news! Your PromoHive account has been approved and you're now ready to start earning rewards.</p>
            
            <div class="bonus-box">
              <h3>🎁 Welcome Bonus: $5.00</h3>
              <p>As a welcome gift, we've added $5.00 to your account balance. You can start completing tasks right away!</p>
            </div>
            
            <h3>What You Can Do Now:</h3>
            <ul>
              <li>✅ Browse and complete available tasks</li>
              <li>💰 Earn rewards for each completed task</li>
              <li>👥 Refer friends and earn $5 for each referral</li>
              <li>📈 Upgrade your level for higher rewards</li>
              <li>💳 Withdraw your earnings (minimum $10)</li>
            </ul>
            
            <a href="{{dashboardUrl}}" class="button">Start Earning Now</a>
            
            <h3>Level System:</h3>
            <ul>
              <li><strong>Level 0:</strong> $9.90 earning limit (encourages upgrade)</li>
              <li><strong>Level 1:</strong> $70 rewards, unlimited tasks</li>
              <li><strong>Level 2:</strong> $130 rewards, premium features</li>
              <li><strong>Level 3:</strong> $180 rewards, VIP benefits</li>
            </ul>
          </div>
          <div class="footer">
            <p>Best regards,<br>The PromoHive Team</p>
            <p>© 2024 PromoHive Global Promo Network. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  },
  
  taskApproved: {
    subject: "✅ Task Approved - You've Earned ${{reward}}!",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Task Approved - PromoHive</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .reward-box { background: #d4edda; border: 1px solid #c3e6cb; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center; }
          .button { display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Task Approved!</h1>
            <p>Great work on completing your task!</p>
          </div>
          <div class="content">
            <h2>Hi {{name}},</h2>
            <p>Congratulations! Your task submission has been approved.</p>
            
            <div class="reward-box">
              <h3>💰 You've Earned: ${{reward}}</h3>
              <p><strong>Task:</strong> {{taskTitle}}</p>
              <p><strong>Completed:</strong> {{completedAt}}</p>
            </div>
            
            <p>Your reward has been added to your account balance. Keep up the great work!</p>
            
            <a href="{{tasksUrl}}" class="button">Complete More Tasks</a>
            
            <h3>Your Current Stats:</h3>
            <ul>
              <li>💰 Current Balance: ${{balance}}</li>
              <li>📊 Total Earned: ${{totalEarned}}</li>
              <li>🎯 Level: {{level}}</li>
              <li>⭐ Points: {{points}}</li>
            </ul>
          </div>
          <div class="footer">
            <p>Best regards,<br>The PromoHive Team</p>
            <p>© 2024 PromoHive Global Promo Network. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  },
  
  taskRejected: {
    subject: "❌ Task Submission Needs Revision",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Task Revision Required - PromoHive</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .feedback-box { background: #f8d7da; border: 1px solid #f5c6cb; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .button { display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📝 Revision Required</h1>
            <p>Your task submission needs some adjustments</p>
          </div>
          <div class="content">
            <h2>Hi {{name}},</h2>
            <p>We've reviewed your task submission and it needs some revisions before we can approve it.</p>
            
            <div class="feedback-box">
              <h3>📋 Task: {{taskTitle}}</h3>
              <h4>Feedback:</h4>
              <p>{{feedback}}</p>
            </div>
            
            <p>Please review the feedback above and resubmit your task with the necessary changes.</p>
            
            <a href="{{taskUrl}}" class="button">Revise Task Submission</a>
            
            <h3>Tips for Better Submissions:</h3>
            <ul>
              <li>📖 Read the task requirements carefully</li>
              <li>✅ Follow all instructions precisely</li>
              <li>📸 Provide clear, high-quality images when required</li>
              <li>📝 Write detailed responses for text tasks</li>
              <li>🔗 Ensure all links are working and accessible</li>
            </ul>
          </div>
          <div class="footer">
            <p>Best regards,<br>The PromoHive Team</p>
            <p>© 2024 PromoHive Global Promo Network. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  },
  
  withdrawalProcessed: {
    subject: "💰 Withdrawal Processed - ${{amount}}",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Withdrawal Processed - PromoHive</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .withdrawal-box { background: #d4edda; border: 1px solid #c3e6cb; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .button { display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💰 Withdrawal Processed!</h1>
            <p>Your earnings are on the way</p>
          </div>
          <div class="content">
            <h2>Hi {{name}},</h2>
            <p>Great news! Your withdrawal request has been processed successfully.</p>
            
            <div class="withdrawal-box">
              <h3>💳 Withdrawal Details:</h3>
              <p><strong>Amount:</strong> ${{amount}}</p>
              <p><strong>Method:</strong> {{method}}</p>
              <p><strong>Processed:</strong> {{processedAt}}</p>
              <p><strong>Transaction ID:</strong> {{transactionId}}</p>
            </div>
            
            <p>The funds should appear in your account within 1-3 business days, depending on your payment method.</p>
            
            <a href="{{transactionsUrl}}" class="button">View Transaction History</a>
            
            <h3>Keep Earning!</h3>
            <p>Continue completing tasks to build up your balance for the next withdrawal.</p>
            
            <a href="{{tasksUrl}}" class="button">Complete More Tasks</a>
          </div>
          <div class="footer">
            <p>Best regards,<br>The PromoHive Team</p>
            <p>© 2024 PromoHive Global Promo Network. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  },
  
  levelUpgraded: {
    subject: "🚀 Level Upgraded to Level {{level}}!",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Level Upgraded - PromoHive</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #6f42c1 0%, #e83e8c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .level-box { background: #e2e3e5; border: 2px solid #6f42c1; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center; }
          .benefits-box { background: #d1ecf1; border: 1px solid #bee5eb; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .button { display: inline-block; background: #6f42c1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚀 Level Upgraded!</h1>
            <p>Congratulations on reaching Level {{level}}!</p>
          </div>
          <div class="content">
            <h2>Hi {{name}},</h2>
            <p>Fantastic! You've successfully upgraded to Level {{level}}!</p>
            
            <div class="level-box">
              <h2>🎯 Level {{level}}</h2>
              <p><strong>Max Earnings:</strong> ${{maxEarnings}}</p>
              <p><strong>Upgrade Cost:</strong> ${{upgradeCost}}</p>
            </div>
            
            <div class="benefits-box">
              <h3>🎁 New Benefits:</h3>
              <ul>
                {{#each benefits}}
                <li>{{this}}</li>
                {{/each}}
              </ul>
            </div>
            
            <p>You now have access to higher-paying tasks and exclusive features. Make the most of your new level!</p>
            
            <a href="{{tasksUrl}}" class="button">Explore New Tasks</a>
            
            <h3>Next Level:</h3>
            <p>Ready for the next challenge? Level {{nextLevel}} offers even greater rewards!</p>
          </div>
          <div class="footer">
            <p>Best regards,<br>The PromoHive Team</p>
            <p>© 2024 PromoHive Global Promo Network. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  },
  
  referralBonus: {
    subject: "🎁 Referral Bonus Earned - ${{amount}}!",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Referral Bonus - PromoHive</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #17a2b8 0%, #138496 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .bonus-box { background: #d1ecf1; border: 1px solid #bee5eb; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center; }
          .button { display: inline-block; background: #17a2b8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎁 Referral Bonus!</h1>
            <p>You've earned a referral bonus!</p>
          </div>
          <div class="content">
            <h2>Hi {{name}},</h2>
            <p>Congratulations! You've earned a referral bonus for bringing a new member to PromoHive.</p>
            
            <div class="bonus-box">
              <h3>💰 Referral Bonus: ${{amount}}</h3>
              <p><strong>Referred User:</strong> {{referredUser}}</p>
              <p><strong>Earned:</strong> {{earnedAt}}</p>
            </div>
            
            <p>Your referral bonus has been added to your account balance. Keep referring friends to earn more bonuses!</p>
            
            <a href="{{referralsUrl}}" class="button">View Referral Stats</a>
            
            <h3>Referral Program:</h3>
            <ul>
              <li>💰 Earn $5 for each successful referral</li>
              <li>👥 Share your referral link: {{referralLink}}</li>
              <li>📱 Share on social media for more reach</li>
              <li>🎯 No limit on referrals</li>
            </ul>
            
            <a href="{{shareUrl}}" class="button">Share Referral Link</a>
          </div>
          <div class="footer">
            <p>Best regards,<br>The PromoHive Team</p>
            <p>© 2024 PromoHive Global Promo Network. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  },
  
  securityAlert: {
    subject: "🔒 Security Alert - PromoHive Account",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Security Alert - PromoHive</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .alert-box { background: #f8d7da; border: 1px solid #f5c6cb; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .button { display: inline-block; background: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔒 Security Alert</h1>
            <p>Important account security notice</p>
          </div>
          <div class="content">
            <h2>Hi {{name}},</h2>
            <p>We've detected unusual activity on your PromoHive account and want to make sure it's secure.</p>
            
            <div class="alert-box">
              <h3>⚠️ Activity Details:</h3>
              <p><strong>Action:</strong> {{action}}</p>
              <p><strong>Time:</strong> {{timestamp}}</p>
              <p><strong>Location:</strong> {{location}}</p>
              <p><strong>Device:</strong> {{device}}</p>
            </div>
            
            <p>If this was you, no action is needed. If you don't recognize this activity, please secure your account immediately.</p>
            
            <a href="{{securityUrl}}" class="button">Secure My Account</a>
            
            <h3>Security Tips:</h3>
            <ul>
              <li>🔐 Use a strong, unique password</li>
              <li>🔑 Enable two-factor authentication</li>
              <li>📱 Keep your contact information updated</li>
              <li>🚫 Never share your login credentials</li>
            </ul>
            
            <p>If you have any concerns, contact our support team immediately.</p>
          </div>
          <div class="footer">
            <p>Best regards,<br>The PromoHive Security Team</p>
            <p>© 2024 PromoHive Global Promo Network. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  },
};

// ===== EMAIL FUNCTIONS =====
export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || "PromoHive <noreply@promohive.com>",
      to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      attachments: options.attachments,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to: ${mailOptions.to}`);
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
};

export const sendTemplateEmail = async (
  templateName: string,
  to: string | string[],
  variables: Record<string, any> = {}
): Promise<void> => {
  const template = emailTemplates[templateName];
  if (!template) {
    throw new Error(`Email template '${templateName}' not found`);
  }

  // Replace variables in template
  let html = template.html;
  let text = template.text || "";
  let subject = template.subject;

  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, "g");
    html = html.replace(regex, String(value));
    text = text.replace(regex, String(value));
    subject = subject.replace(regex, String(value));
  });

  await sendEmail({
    to,
    subject,
    html,
    text,
  });
};

// ===== SPECIFIC EMAIL FUNCTIONS =====
export const sendWelcomeEmail = async (email: string, name: string): Promise<void> => {
  await sendTemplateEmail("welcome", email, {
    name,
    loginUrl: `${process.env.FRONTEND_URL}/login`,
  });
};

export const sendAccountApprovedEmail = async (email: string, name: string): Promise<void> => {
  await sendTemplateEmail("accountApproved", email, {
    name,
    dashboardUrl: `${process.env.FRONTEND_URL}/dashboard`,
  });
};

export const sendTaskApprovedEmail = async (
  email: string,
  name: string,
  taskTitle: string,
  reward: number,
  balance: number,
  totalEarned: number,
  level: number,
  points: number
): Promise<void> => {
  await sendTemplateEmail("taskApproved", email, {
    name,
    taskTitle,
    reward,
    completedAt: new Date().toLocaleString(),
    balance,
    totalEarned,
    level,
    points,
    tasksUrl: `${process.env.FRONTEND_URL}/tasks`,
  });
};

export const sendTaskRejectedEmail = async (
  email: string,
  name: string,
  taskTitle: string,
  feedback: string
): Promise<void> => {
  await sendTemplateEmail("taskRejected", email, {
    name,
    taskTitle,
    feedback,
    taskUrl: `${process.env.FRONTEND_URL}/tasks`,
  });
};

export const sendWithdrawalProcessedEmail = async (
  email: string,
  name: string,
  amount: number,
  method: string,
  transactionId: string
): Promise<void> => {
  await sendTemplateEmail("withdrawalProcessed", email, {
    name,
    amount,
    method,
    processedAt: new Date().toLocaleString(),
    transactionId,
    transactionsUrl: `${process.env.FRONTEND_URL}/earnings`,
    tasksUrl: `${process.env.FRONTEND_URL}/tasks`,
  });
};

export const sendLevelUpgradedEmail = async (
  email: string,
  name: string,
  level: number,
  maxEarnings: number,
  upgradeCost: number,
  benefits: string[],
  nextLevel: number
): Promise<void> => {
  await sendTemplateEmail("levelUpgraded", email, {
    name,
    level,
    maxEarnings,
    upgradeCost,
    benefits: benefits.join("</li><li>"),
    nextLevel,
    tasksUrl: `${process.env.FRONTEND_URL}/tasks`,
  });
};

export const sendReferralBonusEmail = async (
  email: string,
  name: string,
  amount: number,
  referredUser: string,
  referralLink: string
): Promise<void> => {
  await sendTemplateEmail("referralBonus", email, {
    name,
    amount,
    referredUser,
    earnedAt: new Date().toLocaleString(),
    referralsUrl: `${process.env.FRONTEND_URL}/referrals`,
    referralLink,
    shareUrl: `https://wa.me/17253348692?text=${encodeURIComponent(`Join PromoHive and start earning! Use my referral link: ${referralLink}`)}`,
  });
};

export const sendSecurityAlertEmail = async (
  email: string,
  name: string,
  action: string,
  location: string,
  device: string
): Promise<void> => {
  await sendTemplateEmail("securityAlert", email, {
    name,
    action,
    timestamp: new Date().toLocaleString(),
    location,
    device,
    securityUrl: `${process.env.FRONTEND_URL}/settings/security`,
  });
};

// ===== EMAIL TEMPLATE MANAGEMENT =====
export const getEmailTemplate = async (key: string): Promise<any> => {
  return await prisma.emailTemplate.findUnique({
    where: { key },
  });
};

export const createEmailTemplate = async (template: {
  key: string;
  name: string;
  subject: string;
  htmlTemplate: string;
  textTemplate?: string;
  variables?: Record<string, any>;
}): Promise<any> => {
  return await prisma.emailTemplate.create({
    data: template,
  });
};

export const updateEmailTemplate = async (
  key: string,
  updates: {
    name?: string;
    subject?: string;
    htmlTemplate?: string;
    textTemplate?: string;
    variables?: Record<string, any>;
    isActive?: boolean;
  }
): Promise<any> => {
  return await prisma.emailTemplate.update({
    where: { key },
    data: updates,
  });
};

export const deleteEmailTemplate = async (key: string): Promise<void> => {
  await prisma.emailTemplate.delete({
    where: { key },
  });
};

// ===== EMAIL VERIFICATION =====
export const sendEmailVerification = async (email: string, name: string, verificationCode: string): Promise<void> => {
  await sendTemplateEmail("emailVerification", email, {
    name,
    verificationCode,
    verificationUrl: `${process.env.FRONTEND_URL}/verify-email?code=${verificationCode}`,
  });
};

// ===== BULK EMAIL =====
export const sendBulkEmail = async (
  recipients: string[],
  subject: string,
  html: string,
  text?: string
): Promise<void> => {
  const batchSize = 50; // Send in batches to avoid overwhelming the email service
  
  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize);
    
    await Promise.all(
      batch.map(email =>
        sendEmail({
          to: email,
          subject,
          html,
          text,
        }).catch(error => {
          console.error(`Failed to send email to ${email}:`, error);
        })
      )
    );
    
    // Add delay between batches
    if (i + batchSize < recipients.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
};

// ===== LEGACY FUNCTIONS (for backward compatibility) =====
export async function sendMail(to: string, subject: string, html: string, text?: string) {
  return sendEmail({ to, subject, html, text });
}

export async function sendVerificationCode(to: string, code: string) {
  const subject = `Your PromoHive verification code`;
  const html = `<div style="font-family: Inter, system-ui, sans-serif;color:#111"><p>Your verification code is <strong>${code}</strong></p><p>Enter this code in the app to verify your email.</p></div>`;
  return sendMail(to, subject, html, `Your verification code is ${code}`);
}

export default {
  sendEmail,
  sendTemplateEmail,
  sendWelcomeEmail,
  sendAccountApprovedEmail,
  sendTaskApprovedEmail,
  sendTaskRejectedEmail,
  sendWithdrawalProcessedEmail,
  sendLevelUpgradedEmail,
  sendReferralBonusEmail,
  sendSecurityAlertEmail,
  getEmailTemplate,
  createEmailTemplate,
  updateEmailTemplate,
  deleteEmailTemplate,
  sendEmailVerification,
  sendBulkEmail,
  sendMail,
  sendVerificationCode,
};