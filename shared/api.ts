/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

// ===== USER MANAGEMENT TYPES =====
export interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  country?: string;
  phoneCode?: string;
  avatar?: string;
  bio?: string;
  socialLinks?: Record<string, string>;
  role: UserRole;
  status: UserStatus;
  verified: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  twoFactorEnabled: boolean;
  level: number;
  points: number;
  balance: number;
  totalEarned: number;
  welcomeBonus: boolean;
  lastLoginAt?: string;
  language: string;
  timezone?: string;
  notificationPrefs?: NotificationPreferences;
  privacySettings?: PrivacySettings;
  referralCode: string;
  referredBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Admin {
  id: string;
  email: string;
  name?: string;
  role: AdminRole;
  permissions?: string[];
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginHistory {
  id: string;
  userId: string;
  ipAddress?: string;
  userAgent?: string;
  location?: string;
  success: boolean;
  createdAt: string;
}

export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
  SUPER_ADMIN = "SUPER_ADMIN"
}

export enum UserStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  SUSPENDED = "SUSPENDED",
  BANNED = "BANNED"
}

export enum AdminRole {
  ADMIN = "ADMIN",
  SUPER_ADMIN = "SUPER_ADMIN",
  MODERATOR = "MODERATOR"
}

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  inApp: boolean;
}

export interface PrivacySettings {
  profileVisibility: "public" | "private" | "friends";
  dataSharing: boolean;
  analytics: boolean;
}

// ===== AUTHENTICATION TYPES =====
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
  twoFactorCode?: string;
}

export interface RegisterRequest {
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

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
  expiresIn: number;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  password: string;
}

export interface TwoFactorSetup {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

// ===== TASK MANAGEMENT TYPES =====
export interface Task {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  type: TaskType;
  category?: string;
  tags: string[];
  reward: number;
  difficulty: TaskDifficulty;
  estimatedTime?: number;
  minLevel: number;
  maxParticipants?: number;
  ageRestriction?: number;
  countryRestriction: string[];
  skillRequirements: string[];
  verificationType: VerificationType;
  verificationData?: Record<string, any>;
  status: TaskStatus;
  publishedAt?: string;
  expiresAt?: string;
  autoApprove: boolean;
  metadata?: Record<string, any>;
  attachments: string[];
  createdAt: string;
  updatedAt: string;
  submissions?: Submission[];
  taskViews?: TaskView[];
}

export interface TaskView {
  id: string;
  taskId: string;
  userId?: string;
  ipAddress?: string;
  createdAt: string;
}

export interface Submission {
  id: string;
  userId: string;
  taskId: string;
  status: SubmissionStatus;
  payload?: Record<string, any>;
  attachments: string[];
  notes?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  score?: number;
  feedback?: string;
  startedAt?: string;
  completedAt?: string;
  submittedAt: string;
  user?: User;
  task?: Task;
}

export enum TaskType {
  TEXT_VERIFICATION = "TEXT_VERIFICATION",
  URL_VERIFICATION = "URL_VERIFICATION",
  IMAGE_VERIFICATION = "IMAGE_VERIFICATION",
  VIDEO_VERIFICATION = "VIDEO_VERIFICATION",
  FILE_VERIFICATION = "FILE_VERIFICATION",
  SURVEY_VERIFICATION = "SURVEY_VERIFICATION",
  LOCATION_VERIFICATION = "LOCATION_VERIFICATION",
  SOCIAL_MEDIA_VERIFICATION = "SOCIAL_MEDIA_VERIFICATION",
  NO_VERIFICATION = "NO_VERIFICATION"
}

export enum TaskDifficulty {
  EASY = "EASY",
  MEDIUM = "MEDIUM",
  HARD = "HARD",
  EXPERT = "EXPERT"
}

export enum VerificationType {
  MANUAL = "MANUAL",
  AUTOMATIC = "AUTOMATIC",
  PEER_REVIEW = "PEER_REVIEW",
  AI_VERIFICATION = "AI_VERIFICATION"
}

export enum TaskStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  PAUSED = "PAUSED",
  COMPLETED = "COMPLETED",
  ARCHIVED = "ARCHIVED"
}

export enum SubmissionStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  NEEDS_REVISION = "NEEDS_REVISION",
  UNDER_REVIEW = "UNDER_REVIEW"
}

// ===== FINANCIAL TYPES =====
export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  taskId?: string;
  submissionId?: string;
  withdrawalId?: string;
  referralId?: string;
  paymentMethod?: string;
  paymentId?: string;
  currency: string;
  description?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  processedAt?: string;
  user?: User;
}

export interface Withdrawal {
  id: string;
  userId: string;
  amount: number;
  status: WithdrawalStatus;
  method: WithdrawalMethod;
  paymentDetails?: Record<string, any>;
  processingFee: number;
  processedBy?: string;
  processedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  user?: User;
}

export interface PaymentMethod {
  id: string;
  userId: string;
  type: PaymentMethodType;
  isDefault: boolean;
  encryptedData: Record<string, any>;
  last4?: string;
  brand?: string;
  createdAt: string;
  updatedAt: string;
}

export enum TransactionType {
  TASK_REWARD = "TASK_REWARD",
  REFERRAL_BONUS = "REFERRAL_BONUS",
  WELCOME_BONUS = "WELCOME_BONUS",
  LEVEL_UPGRADE = "LEVEL_UPGRADE",
  WITHDRAWAL = "WITHDRAWAL",
  REFUND = "REFUND",
  PENALTY = "PENALTY",
  ADMIN_ADJUSTMENT = "ADMIN_ADJUSTMENT"
}

export enum TransactionStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
  REFUNDED = "REFUNDED"
}

export enum WithdrawalStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED"
}

export enum WithdrawalMethod {
  BANK_TRANSFER = "BANK_TRANSFER",
  PAYPAL = "PAYPAL",
  CRYPTO = "CRYPTO",
  CASHAPP = "CASHAPP",
  VENMO = "VENMO",
  WESTERN_UNION = "WESTERN_UNION"
}

export enum PaymentMethodType {
  CREDIT_CARD = "CREDIT_CARD",
  DEBIT_CARD = "DEBIT_CARD",
  BANK_ACCOUNT = "BANK_ACCOUNT",
  PAYPAL = "PAYPAL",
  CRYPTO_WALLET = "CRYPTO_WALLET"
}

// ===== REFERRAL TYPES =====
export interface Referral {
  id: string;
  referrerId: string;
  refereeId: string;
  reward: number;
  status: ReferralStatus;
  source?: string;
  campaign?: string;
  createdAt: string;
  rewardedAt?: string;
  referrer?: User;
  referee?: User;
}

export enum ReferralStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED"
}

// ===== GAMIFICATION TYPES =====
export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  progress: number;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  achievement?: Achievement;
}

export interface Achievement {
  id: string;
  key: string;
  name: string;
  description: string;
  icon?: string;
  category: AchievementCategory;
  points: number;
  reward: number;
  requirements?: Record<string, any>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LevelUpgrade {
  id: string;
  userId: string;
  fromLevel: number;
  toLevel: number;
  cost: number;
  status: UpgradeStatus;
  paymentId?: string;
  createdAt: string;
  processedAt?: string;
}

export enum AchievementCategory {
  TASK_COMPLETION = "TASK_COMPLETION",
  REFERRAL = "REFERRAL",
  LEVEL = "LEVEL",
  STREAK = "STREAK",
  SPECIAL = "SPECIAL",
  SOCIAL = "SOCIAL"
}

export enum UpgradeStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED"
}

// ===== NOTIFICATION TYPES =====
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  readAt?: string;
  channels: NotificationChannel[];
  createdAt: string;
}

export interface EmailTemplate {
  id: string;
  key: string;
  name: string;
  subject: string;
  htmlTemplate: string;
  textTemplate?: string;
  variables?: Record<string, any>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SMSTemplate {
  id: string;
  key: string;
  name: string;
  message: string;
  variables?: Record<string, any>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum NotificationType {
  TASK_ASSIGNED = "TASK_ASSIGNED",
  TASK_COMPLETED = "TASK_COMPLETED",
  TASK_APPROVED = "TASK_APPROVED",
  TASK_REJECTED = "TASK_REJECTED",
  PAYMENT_RECEIVED = "PAYMENT_RECEIVED",
  WITHDRAWAL_PROCESSED = "WITHDRAWAL_PROCESSED",
  LEVEL_UPGRADED = "LEVEL_UPGRADED",
  ACHIEVEMENT_UNLOCKED = "ACHIEVEMENT_UNLOCKED",
  REFERRAL_BONUS = "REFERRAL_BONUS",
  ACCOUNT_APPROVED = "ACCOUNT_APPROVED",
  ACCOUNT_SUSPENDED = "ACCOUNT_SUSPENDED",
  SECURITY_ALERT = "SECURITY_ALERT",
  SYSTEM_ANNOUNCEMENT = "SYSTEM_ANNOUNCEMENT"
}

export enum NotificationChannel {
  IN_APP = "IN_APP",
  EMAIL = "EMAIL",
  SMS = "SMS",
  PUSH = "PUSH"
}

// ===== SUPPORT TYPES =====
export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  description: string;
  category: SupportCategory;
  priority: SupportPriority;
  status: SupportStatus;
  assignedTo?: string;
  assignedAt?: string;
  resolvedAt?: string;
  resolution?: string;
  createdAt: string;
  updatedAt: string;
  messages?: SupportMessage[];
  user?: User;
}

export interface SupportMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderType: SenderType;
  message: string;
  attachments: string[];
  createdAt: string;
}

export enum SupportCategory {
  TECHNICAL = "TECHNICAL",
  PAYMENT = "PAYMENT",
  ACCOUNT = "ACCOUNT",
  TASK = "TASK",
  GENERAL = "GENERAL"
}

export enum SupportPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  URGENT = "URGENT"
}

export enum SupportStatus {
  OPEN = "OPEN",
  IN_PROGRESS = "IN_PROGRESS",
  RESOLVED = "RESOLVED",
  CLOSED = "CLOSED"
}

export enum SenderType {
  USER = "USER",
  ADMIN = "ADMIN",
  SYSTEM = "SYSTEM"
}

// ===== ANALYTICS TYPES =====
export interface Analytics {
  id: string;
  date: string;
  metric: string;
  value: number;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface Report {
  id: string;
  name: string;
  type: ReportType;
  parameters?: Record<string, any>;
  data?: Record<string, any>;
  generatedBy?: string;
  generatedAt: string;
}

export enum ReportType {
  USER_ANALYTICS = "USER_ANALYTICS",
  TASK_PERFORMANCE = "TASK_PERFORMANCE",
  FINANCIAL_SUMMARY = "FINANCIAL_SUMMARY",
  REFERRAL_STATS = "REFERRAL_STATS",
  SYSTEM_HEALTH = "SYSTEM_HEALTH"
}

// ===== SYSTEM TYPES =====
export interface Setting {
  id: string;
  key: string;
  value: any;
  category?: string;
  description?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  actorId?: string;
  actorType?: string;
  action: string;
  resource?: string;
  resourceId?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

// ===== CONTEST TYPES =====
export interface Contest {
  id: string;
  name: string;
  description: string;
  type: ContestType;
  startDate: string;
  endDate: string;
  prize: number;
  rules?: Record<string, any>;
  status: ContestStatus;
  createdAt: string;
  updatedAt: string;
  participants?: ContestParticipant[];
}

export interface ContestParticipant {
  id: string;
  contestId: string;
  userId: string;
  score: number;
  rank?: number;
  prize?: number;
  createdAt: string;
}

export enum ContestType {
  MONTHLY = "MONTHLY",
  WEEKLY = "WEEKLY",
  SPECIAL_EVENT = "SPECIAL_EVENT",
  REFERRAL = "REFERRAL",
  QUALITY_BASED = "QUALITY_BASED"
}

export enum ContestStatus {
  DRAFT = "DRAFT",
  ACTIVE = "ACTIVE",
  ENDED = "ENDED",
  CANCELLED = "CANCELLED"
}

// ===== API RESPONSE TYPES =====
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalTasks: number;
  completedTasks: number;
  totalEarnings: number;
  pendingWithdrawals: number;
  totalReferrals: number;
  systemHealth: number;
}

export interface UserDashboardStats {
  balance: number;
  totalEarned: number;
  level: number;
  points: number;
  completedTasks: number;
  pendingTasks: number;
  totalReferrals: number;
  achievements: number;
  nextLevelProgress: number;
}

// ===== FORM TYPES =====
export interface TaskCreateRequest {
  title: string;
  description: string;
  shortDescription?: string;
  type: TaskType;
  category?: string;
  tags: string[];
  reward: number;
  difficulty: TaskDifficulty;
  estimatedTime?: number;
  minLevel: number;
  maxParticipants?: number;
  ageRestriction?: number;
  countryRestriction: string[];
  skillRequirements: string[];
  verificationType: VerificationType;
  verificationData?: Record<string, any>;
  expiresAt?: string;
  autoApprove: boolean;
  attachments: string[];
}

export interface TaskUpdateRequest extends Partial<TaskCreateRequest> {
  status?: TaskStatus;
}

export interface SubmissionCreateRequest {
  taskId: string;
  payload?: Record<string, any>;
  attachments: string[];
  notes?: string;
}

export interface WithdrawalRequest {
  amount: number;
  method: WithdrawalMethod;
  paymentDetails: Record<string, any>;
}

export interface PaymentMethodRequest {
  type: PaymentMethodType;
  encryptedData: Record<string, any>;
  isDefault?: boolean;
}

// ===== LEVEL SYSTEM TYPES =====
export interface LevelInfo {
  level: number;
  name: string;
  description: string;
  maxEarnings: number;
  benefits: string[];
  upgradeCost?: number;
  requirements?: Record<string, any>;
}

export interface LevelUpgradeRequest {
  toLevel: number;
  paymentMethodId: string;
}

// ===== WHATSAPP INTEGRATION =====
export interface WhatsAppMessage {
  phoneNumber: string;
  message: string;
  template?: string;
  variables?: Record<string, string>;
}

// ===== DEMO RESPONSE (keeping existing) =====
export interface DemoResponse {
  message: string;
}
