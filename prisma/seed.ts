import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 12);
  
  const admin = await prisma.admin.upsert({
    where: { email: "admin@promohive.com" },
    update: {},
    create: {
      email: "admin@promohive.com",
      name: "PromoHive Admin",
      role: "SUPER_ADMIN",
      permissions: [
        "users.read",
        "users.write",
        "users.delete",
        "tasks.read",
        "tasks.write",
        "tasks.delete",
        "transactions.read",
        "transactions.write",
        "withdrawals.read",
        "withdrawals.write",
        "withdrawals.approve",
        "analytics.read",
        "settings.read",
        "settings.write",
        "notifications.read",
        "notifications.write",
        "reports.read",
        "reports.write",
        "audit.read",
        "system.read",
        "system.write"
      ],
    },
  });

  console.log("✅ Admin user created:", admin.email);

  // Create demo user
  const userPassword = await bcrypt.hash("user123", 12);
  
  const demoUser = await prisma.user.upsert({
    where: { email: "demo@promohive.com" },
    update: {},
    create: {
      email: "demo@promohive.com",
      passwordHash: userPassword,
      name: "Demo User",
      phone: "+1234567890",
      country: "US",
      phoneCode: "+1",
      role: "USER",
      status: "APPROVED",
      verified: true,
      emailVerified: true,
      level: 1,
      points: 150,
      balance: 25.50,
      totalEarned: 45.50,
      welcomeBonus: true,
      referralCode: "DEMO123",
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

  console.log("✅ Demo user created:", demoUser.email);

  // Create sample tasks
  const tasks = [
    {
      title: "Follow Instagram Account",
      description: "Follow our Instagram account @promohive and like our latest 3 posts. Take a screenshot showing you're following and have liked the posts.",
      shortDescription: "Follow and like Instagram posts",
      type: "IMAGE_VERIFICATION",
      category: "Social Media",
      tags: ["instagram", "social", "follow"],
      reward: 2.50,
      difficulty: "EASY",
      estimatedTime: 5,
      minLevel: 0,
      maxParticipants: 100,
      verificationType: "MANUAL",
      verificationData: {
        requiredImages: 1,
        imageDescription: "Screenshot showing following status and liked posts"
      },
      status: "PUBLISHED",
      publishedAt: new Date(),
      autoApprove: false,
      attachments: [],
    },
    {
      title: "Share Facebook Post",
      description: "Share our promotional post on your Facebook timeline. The post should be visible to your friends. Take a screenshot of the shared post.",
      shortDescription: "Share Facebook post",
      type: "IMAGE_VERIFICATION",
      category: "Social Media",
      tags: ["facebook", "social", "share"],
      reward: 3.00,
      difficulty: "EASY",
      estimatedTime: 3,
      minLevel: 0,
      maxParticipants: 50,
      verificationType: "MANUAL",
      verificationData: {
        requiredImages: 1,
        imageDescription: "Screenshot of shared Facebook post"
      },
      status: "PUBLISHED",
      publishedAt: new Date(),
      autoApprove: false,
      attachments: [],
    },
    {
      title: "Write Product Review",
      description: "Write a detailed review (minimum 100 words) about our product. Include your honest opinion, pros and cons, and overall rating. Submit the review text.",
      shortDescription: "Write detailed product review",
      type: "TEXT_VERIFICATION",
      category: "Content Creation",
      tags: ["review", "writing", "content"],
      reward: 5.00,
      difficulty: "MEDIUM",
      estimatedTime: 15,
      minLevel: 1,
      maxParticipants: 25,
      verificationType: "MANUAL",
      verificationData: {
        minWords: 100,
        requiredFields: ["rating", "pros", "cons", "overall"]
      },
      status: "PUBLISHED",
      publishedAt: new Date(),
      autoApprove: false,
      attachments: [],
    },
    {
      title: "Subscribe to YouTube Channel",
      description: "Subscribe to our YouTube channel and watch at least 2 videos completely. Take a screenshot showing your subscription and the watched videos.",
      shortDescription: "Subscribe and watch YouTube videos",
      type: "IMAGE_VERIFICATION",
      category: "Social Media",
      tags: ["youtube", "subscribe", "watch"],
      reward: 4.00,
      difficulty: "MEDIUM",
      estimatedTime: 10,
      minLevel: 1,
      maxParticipants: 75,
      verificationType: "MANUAL",
      verificationData: {
        requiredImages: 1,
        imageDescription: "Screenshot showing subscription and watched videos"
      },
      status: "PUBLISHED",
      publishedAt: new Date(),
      autoApprove: false,
      attachments: [],
    },
    {
      title: "Complete Survey",
      description: "Complete our customer satisfaction survey. Answer all questions honestly and provide detailed feedback where requested.",
      shortDescription: "Complete customer survey",
      type: "SURVEY_VERIFICATION",
      category: "Research",
      tags: ["survey", "feedback", "research"],
      reward: 3.50,
      difficulty: "EASY",
      estimatedTime: 8,
      minLevel: 0,
      maxParticipants: 200,
      verificationType: "AUTOMATIC",
      verificationData: {
        requiredQuestions: 10,
        minAnswers: 10
      },
      status: "PUBLISHED",
      publishedAt: new Date(),
      autoApprove: true,
      attachments: [],
    },
  ];

  for (const taskData of tasks) {
    const task = await prisma.task.upsert({
      where: { id: `task-${taskData.title.toLowerCase().replace(/\s+/g, '-')}` },
      update: {},
      create: {
        id: `task-${taskData.title.toLowerCase().replace(/\s+/g, '-')}`,
        ...taskData,
      },
    });
    console.log(`✅ Task created: ${task.title}`);
  }

  // Create achievements
  const achievements = [
    {
      key: "first_task",
      name: "First Steps",
      description: "Complete your first task",
      icon: "🎯",
      category: "TASK_COMPLETION",
      points: 10,
      reward: 1.00,
      requirements: { tasksCompleted: 1 },
      isActive: true,
    },
    {
      key: "task_master",
      name: "Task Master",
      description: "Complete 10 tasks",
      icon: "🏆",
      category: "TASK_COMPLETION",
      points: 50,
      reward: 5.00,
      requirements: { tasksCompleted: 10 },
      isActive: true,
    },
    {
      key: "referral_king",
      name: "Referral King",
      description: "Refer 5 friends",
      icon: "👑",
      category: "REFERRAL",
      points: 100,
      reward: 10.00,
      requirements: { referralsCompleted: 5 },
      isActive: true,
    },
    {
      key: "level_up",
      name: "Level Up",
      description: "Reach Level 1",
      icon: "📈",
      category: "LEVEL",
      points: 25,
      reward: 2.50,
      requirements: { level: 1 },
      isActive: true,
    },
    {
      key: "early_bird",
      name: "Early Bird",
      description: "Complete 3 tasks in one day",
      icon: "🐦",
      category: "STREAK",
      points: 30,
      reward: 3.00,
      requirements: { dailyTasks: 3 },
      isActive: true,
    },
  ];

  for (const achievementData of achievements) {
    const achievement = await prisma.achievement.upsert({
      where: { key: achievementData.key },
      update: {},
      create: achievementData,
    });
    console.log(`✅ Achievement created: ${achievement.name}`);
  }

  // Create system settings
  const settings = [
    {
      key: "app_name",
      value: "PromoHive Global Promo Network",
      category: "general",
      description: "Application name",
      isPublic: true,
    },
    {
      key: "welcome_bonus_amount",
      value: 5.00,
      category: "financial",
      description: "Welcome bonus amount for new users",
      isPublic: true,
    },
    {
      key: "referral_bonus_amount",
      value: 5.00,
      category: "financial",
      description: "Referral bonus amount",
      isPublic: true,
    },
    {
      key: "min_withdrawal_amount",
      value: 10.00,
      category: "financial",
      description: "Minimum withdrawal amount",
      isPublic: true,
    },
    {
      key: "level_0_max_earnings",
      value: 9.90,
      category: "levels",
      description: "Maximum earnings for Level 0",
      isPublic: true,
    },
    {
      key: "level_1_reward_limit",
      value: 70.00,
      category: "levels",
      description: "Reward limit for Level 1",
      isPublic: true,
    },
    {
      key: "level_2_reward_limit",
      value: 130.00,
      category: "levels",
      description: "Reward limit for Level 2",
      isPublic: true,
    },
    {
      key: "level_3_reward_limit",
      value: 180.00,
      category: "levels",
      description: "Reward limit for Level 3",
      isPublic: true,
    },
    {
      key: "whatsapp_number",
      value: "+17253348692",
      category: "contact",
      description: "WhatsApp support number",
      isPublic: true,
    },
    {
      key: "support_email",
      value: "support@promohive.com",
      category: "contact",
      description: "Support email address",
      isPublic: true,
    },
  ];

  for (const settingData of settings) {
    const setting = await prisma.setting.upsert({
      where: { key: settingData.key },
      update: {},
      create: settingData,
    });
    console.log(`✅ Setting created: ${setting.key}`);
  }

  // Create email templates
  const emailTemplates = [
    {
      key: "welcome",
      name: "Welcome Email",
      subject: "Welcome to PromoHive Global Promo Network!",
      htmlTemplate: `
        <h1>Welcome to PromoHive!</h1>
        <p>Hi {{name}},</p>
        <p>Thank you for joining PromoHive Global Promo Network!</p>
        <p>Your account is pending approval. Once approved, you'll receive a $5 welcome bonus!</p>
        <p>Best regards,<br>The PromoHive Team</p>
      `,
      textTemplate: "Welcome to PromoHive! Hi {{name}}, thank you for joining us!",
      variables: { name: "string" },
      isActive: true,
    },
    {
      key: "account_approved",
      name: "Account Approved",
      subject: "🎉 Your PromoHive Account Has Been Approved!",
      htmlTemplate: `
        <h1>Account Approved!</h1>
        <p>Hi {{name}},</p>
        <p>Great news! Your PromoHive account has been approved.</p>
        <p>You've received a $5 welcome bonus!</p>
        <p>Best regards,<br>The PromoHive Team</p>
      `,
      textTemplate: "Account Approved! Hi {{name}}, your account has been approved!",
      variables: { name: "string" },
      isActive: true,
    },
  ];

  for (const templateData of emailTemplates) {
    const template = await prisma.emailTemplate.upsert({
      where: { key: templateData.key },
      update: {},
      create: templateData,
    });
    console.log(`✅ Email template created: ${template.name}`);
  }

  console.log("🎉 Database seeding completed successfully!");
  console.log("\n📋 Admin Credentials:");
  console.log("Email: admin@promohive.com");
  console.log("Password: admin123");
  console.log("\n👤 Demo User Credentials:");
  console.log("Email: demo@promohive.com");
  console.log("Password: user123");
  console.log("\n🔗 WhatsApp Support: +1 (725) 334-8692");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
