# 🚀 PromoHive Global Promo Network

A comprehensive, enterprise-grade web application for task completion and reward platform with complete features and details.

## 🌟 Features

### ✅ Authentication & Security
- Complete user registration with email validation
- Secure login with JWT tokens
- Two-factor authentication (2FA)
- Password reset functionality
- Account lockout protection
- Role-based access control

### 👥 User Management
- User profiles with avatar upload
- Account verification system
- Admin approval workflow
- User status management (Pending, Approved, Suspended, Banned)
- Login history tracking

### 📋 Task Management
- Multiple task types (Text, Image, Video, URL, Survey, etc.)
- Task difficulty levels (Easy, Medium, Hard, Expert)
- Verification system (Manual, Automatic, AI, Peer Review)
- Task categories and tags
- Participant limits and restrictions

### 📈 Level System
- **Level 0:** $9.90 earning limit (encourages upgrade)
- **Level 1:** $70 rewards, unlimited tasks
- **Level 2:** $130 rewards, premium features
- **Level 3:** $180 rewards, VIP benefits
- Level upgrade system with payment

### 💰 Financial System
- Multiple payment methods (Credit Card, PayPal, Crypto, etc.)
- Withdrawal system with approval workflow
- Transaction history and tracking
- Referral bonus system ($5 per referral)
- Welcome bonus ($5 for new users)

### 🔔 Notification System
- In-app notifications
- Email notifications with beautiful templates
- SMS notifications (Twilio integration)
- Push notifications
- Notification preferences

### 🎮 Gamification
- Achievement system with badges
- Points and rewards
- Streak bonuses
- Leaderboards
- Contest system

### 🛠️ Admin Panel
- Comprehensive user management
- Task creation and management
- Financial oversight
- Analytics and reporting
- System settings
- Audit logs

### 💬 Support System
- Help desk with ticket system
- Knowledge base
- Live chat integration
- WhatsApp integration (+1 725 334-8692)
- Support categories and priorities

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/1sanadsa1997-ui/PromoHive.git
cd PromoHive

# Install dependencies
pnpm install

# Copy environment file
cp env.local .env

# Edit .env file with your database credentials
# DATABASE_URL="postgresql://username:password@localhost:5432/promohive"
```

### Database Setup

```bash
# Generate Prisma client
pnpm prisma generate

# Run database migrations
pnpm prisma migrate dev

# Seed the database with initial data
npx tsx prisma/seed.ts
```

### Start Development Server

```bash
# Start the development server
pnpm dev
```

The application will be available at: http://localhost:8080

## 🔐 Default Credentials

### Super Admin
- **Email:** admin@promohive.com
- **Password:** admin123
- **Access:** Full admin panel access

### Demo User
- **Email:** demo@promohive.com
- **Password:** user123
- **Access:** Regular user account with sample data

## 📱 Support
- **WhatsApp:** +1 (725) 334-8692
- **Direct Link:** https://wa.me/17253348692
- **Email:** support@promohive.com

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
npx tsx prisma/seed.ts # Seed database
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

## 🎯 Tech Stack

### Frontend
- React 18 with TypeScript
- React Router 6 for navigation
- TailwindCSS for styling
- Radix UI for accessible components
- React Hook Form for form management
- Zod for validation
- React Query for data fetching
- Zustand for state management
- Framer Motion for animations
- Recharts for data visualization

### Backend
- Node.js with Express.js
- TypeScript for type safety
- PostgreSQL with NeonDB
- Prisma ORM for database management
- JWT for authentication
- bcrypt for password hashing
- Nodemailer for email services
- Multer for file uploads
- Helmet for security headers
- Winston for logging

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Contact

- **Project Link:** [https://github.com/1sanadsa1997-ui/PromoHive](https://github.com/1sanadsa1997-ui/PromoHive)
- **WhatsApp:** +1 (725) 334-8692
- **Email:** support@promohive.com

---

⭐ **Star this repository if you found it helpful!**
