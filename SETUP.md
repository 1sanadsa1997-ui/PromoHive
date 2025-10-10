# PromoHive Global Promo Network - Setup Guide

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- pnpm (recommended) or npm

### 2. Installation

```bash
# Clone the repository
git clone <repository-url>
cd spark-home

# Install dependencies
pnpm install

# Copy environment file
cp env.local .env

# Edit .env file with your database credentials
# DATABASE_URL="postgresql://username:password@localhost:5432/promohive"
```

### 3. Database Setup

```bash
# Generate Prisma client
pnpm prisma generate

# Run database migrations
pnpm prisma migrate dev

# Seed the database with initial data
pnpm prisma db seed
```

### 4. Start Development Server

```bash
# Start the development server
pnpm dev
```

The application will be available at: http://localhost:8080

## 🔐 Admin Credentials

### Super Admin
- **Email:** admin@promohive.com
- **Password:** admin123
- **Access:** Full admin panel access

### Demo User
- **Email:** demo@promohive.com
- **Password:** user123
- **Access:** Regular user account with sample data

## 📱 WhatsApp Support
- **Number:** +1 (725) 334-8692
- **Direct Link:** https://wa.me/17253348692

## 🎯 Key Features Implemented

### ✅ Authentication & Security
- Complete user registration with email validation
- Secure login with JWT tokens
- Two-factor authentication (2FA)
- Password reset functionality
- Account lockout protection
- Role-based access control

### ✅ User Management
- User profiles with avatar upload
- Account verification system
- Admin approval workflow
- User status management (Pending, Approved, Suspended, Banned)
- Login history tracking

### ✅ Task Management
- Multiple task types (Text, Image, Video, URL, Survey, etc.)
- Task difficulty levels (Easy, Medium, Hard, Expert)
- Verification system (Manual, Automatic, AI, Peer Review)
- Task categories and tags
- Participant limits and restrictions

### ✅ Level System
- **Level 0:** $9.90 earning limit (encourages upgrade)
- **Level 1:** $70 rewards, unlimited tasks
- **Level 2:** $130 rewards, premium features  
- **Level 3:** $180 rewards, VIP benefits
- Level upgrade system with payment

### ✅ Financial System
- Multiple payment methods (Credit Card, PayPal, Crypto, etc.)
- Withdrawal system with approval workflow
- Transaction history and tracking
- Referral bonus system ($5 per referral)
- Welcome bonus ($5 for new users)

### ✅ Notification System
- In-app notifications
- Email notifications with beautiful templates
- SMS notifications (Twilio integration)
- Push notifications
- Notification preferences

### ✅ Gamification
- Achievement system with badges
- Points and rewards
- Streak bonuses
- Leaderboards
- Contest system

### ✅ Admin Panel
- Comprehensive user management
- Task creation and management
- Financial oversight
- Analytics and reporting
- System settings
- Audit logs

### ✅ Support System
- Help desk with ticket system
- Knowledge base
- Live chat integration
- WhatsApp integration
- Support categories and priorities

## 🛠️ Development Commands

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm start            # Start production server
pnpm typecheck        # TypeScript validation
pnpm test             # Run tests

# Database
pnpm prisma studio    # Open Prisma Studio
pnpm prisma migrate   # Run migrations
pnpm prisma generate  # Generate Prisma client
pnpm prisma db seed   # Seed database
```

## 📁 Project Structure

```
├── client/                 # React frontend
│   ├── components/         # UI components
│   ├── pages/             # Page components
│   ├── hooks/             # Custom hooks
│   └── lib/               # Utilities
├── server/                # Express backend
│   ├── routes/            # API routes
│   ├── lib/               # Server utilities
│   └── config/            # Configuration
├── shared/                # Shared types
├── prisma/                # Database schema
└── public/                # Static assets
```

## 🔧 Configuration

### Environment Variables
All configuration is done through environment variables in `.env`:

- **Database:** PostgreSQL connection string
- **Email:** SMTP configuration for notifications
- **SMS:** Twilio configuration for SMS
- **Payments:** Stripe/PayPal configuration
- **Security:** JWT secrets and security settings
- **Features:** Enable/disable features

### Level System Configuration
```env
LEVEL_0_MAX_EARNINGS=9.90
LEVEL_1_REWARD_LIMIT=70
LEVEL_2_REWARD_LIMIT=130
LEVEL_3_REWARD_LIMIT=180
```

### Referral System
```env
REFERRAL_BONUS_AMOUNT=5.00
WELCOME_BONUS_AMOUNT=5.00
```

## 📊 Sample Data

The seed script creates:
- 1 Super Admin account
- 1 Demo user account
- 5 Sample tasks
- 5 Achievement badges
- System settings
- Email templates

## 🚀 Production Deployment

### Docker Deployment
```bash
# Build Docker image
docker build -t promohive .

# Run with Docker Compose
docker-compose up -d
```

### Manual Deployment
```bash
# Build the application
pnpm build

# Start production server
pnpm start
```

## 📞 Support

- **Email:** support@promohive.com
- **WhatsApp:** +1 (725) 334-8692
- **Admin Panel:** http://localhost:8080/admin

## 🎉 Features Summary

✅ **Complete Authentication System**
✅ **Comprehensive User Dashboard** 
✅ **Advanced Admin Panel**
✅ **Task Management System**
✅ **Payment & Withdrawal System**
✅ **Notification System (Email/SMS/Push)**
✅ **Level System & Gamification**
✅ **Analytics & Reporting**
✅ **Security & Compliance**
✅ **WhatsApp Integration**
✅ **Multi-language Support**
✅ **Mobile Responsive Design**

The application is now ready for production use with all requested features implemented!
