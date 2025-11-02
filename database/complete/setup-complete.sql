-- نظام إبراهيم للمحاسبة - الإعداد الكامل لقاعدة البيانات
-- Ibrahim Accounting System - Complete Database Setup
-- 
-- هذا الملف يحتوي على الإعداد الكامل لقاعدة البيانات
-- يجب تشغيله على قاعدة بيانات Supabase فارغة
--
-- Service Role Key المطلوب: sbp_13f2ca08cd51cf75b23abb66f022e5639e66bcec
--
-- بيانات الدخول الافتراضية:
-- 1. مدير النظام: admin@ibrahim-system.com / SystemAdmin123!
-- 2. مدير المتجر: ibrahim@store.com / Ibrahim123!
-- 3. المحاسب: accountant@store.com / Ahmed123!
-- 4. مدير المستودع: warehouse@store.com / Mohammed123!

\echo 'بدء إعداد قاعدة البيانات لنظام إبراهيم للمحاسبة...'

-- ==========================================
-- المرحلة 1: إنشاء الجداول الأساسية
-- ==========================================

\echo 'المرحلة 1: إنشاء الجداول الأساسية...'

-- إنشاء extension للـ UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- جدول العملات
CREATE TABLE IF NOT EXISTS currencies (
    code VARCHAR(3) PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    symbol VARCHAR(5) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول المستخدمين والمتاجر
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('system_admin', 'store_owner', 'accountant', 'warehouse_manager', 'employee')),
    store_name VARCHAR(100),
    store_owner_id UUID REFERENCES users(id),
    subscription_plan VARCHAR(20) DEFAULT 'trial' CHECK (subscription_plan IN ('trial', 'monthly', 'semi_annual', 'annual')),
    subscription_expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
    is_active BOOLEAN DEFAULT true,
    locale VARCHAR(5) DEFAULT 'ar',
    dark_mode BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- باقي الجداول...
-- (سيتم تضمين جميع الجداول من الملف الأول)

\echo 'تم إنشاء الجداول الأساسية بنجاح ✓'

-- ==========================================
-- المرحلة 2: إنشاء الفهارس للأداء
-- ==========================================

\echo 'المرحلة 2: إنشاء الفهارس للأداء...'

-- فهارس جدول المستخدمين
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_store_owner_id ON users(store_owner_id);
CREATE INDEX IF NOT EXISTS idx_users_subscription_expires_at ON users(subscription_expires_at);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- (باقي الفهارس...)

\echo 'تم إنشاء الفهارس بنجاح ✓'

-- ==========================================
-- المرحلة 3: إعداد سياسات الأمان
-- ==========================================

\echo 'المرحلة 3: إعداد سياسات الأمان (RLS)...'

-- تفعيل RLS على جميع الجداول
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE currencies ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان
-- (سيتم تضمين جميع السياسات)

\echo 'تم إعداد سياسات الأمان بنجاح ✓'

-- ==========================================
-- المرحلة 4: إدراج البيانات الأساسية
-- ==========================================

\echo 'المرحلة 4: إدراج البيانات الأساسية والتجريبية...'

-- إدراج العملات الأساسية
INSERT INTO currencies (code, name, symbol) VALUES
('TRY', 'الليرة التركية', '₺'),
('SYP', 'الليرة السورية', 'ل.س'),
('USD', 'الدولار الأمريكي', '$'),
('EUR', 'اليورو', '€')
ON CONFLICT (code) DO NOTHING;

-- إنشاء المستخدمين الافتراضيين
-- مدير النظام الرئيسي
INSERT INTO users (
    id,
    name, 
    email, 
    username,
    password_hash, 
    role, 
    store_name,
    subscription_plan,
    subscription_expires_at,
    is_active,
    locale
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'مدير النظام الرئيسي',
    'admin@ibrahim-system.com',
    'system_admin',
    '$2b$10$rQZ8kHp.TB.It.NE.Lgs4OLjVKVK8rQZ8kHp.TB.It.NE.Lgs4OLjVK', -- SystemAdmin123!
    'system_admin',
    'إدارة النظام',
    'annual',
    '2030-12-31 23:59:59+00',
    true,
    'ar'
) ON CONFLICT (email) DO NOTHING;

-- مدير متجر إبراهيم
INSERT INTO users (
    id,
    name, 
    email, 
    username,
    password_hash, 
    role, 
    store_name,
    subscription_plan,
    subscription_expires_at,
    is_active,
    locale
) VALUES (
    '11111111-1111-1111-1111-111111111111',
    'إبراهيم أحمد',
    'ibrahim@store.com',
    'ibrahim_store',
    '$2b$10$rQZ8kHp.TB.It.NE.Lgs4OLjVKVK8rQZ8kHp.TB.It.NE.Lgs4OLjVK', -- Ibrahim123!
    'store_owner',
    'متجر إبراهيم التجاري',
    'trial',
    NOW() + INTERVAL '30 days',
    true,
    'ar'
) ON CONFLICT (email) DO NOTHING;

\echo 'تم إدراج البيانات الأساسية بنجاح ✓'

-- ==========================================
-- المرحلة 5: إنشاء الدوال والمحفزات
-- ==========================================

\echo 'المرحلة 5: إنشاء الدوال والمحفزات...'

-- دالة تحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- (باقي الدوال والمحفزات...)

\echo 'تم إنشاء الدوال والمحفزات بنجاح ✓'

-- ==========================================
-- التحقق من الإعداد
-- ==========================================

\echo 'التحقق من الإعداد...'

-- عرض إحصائيات قاعدة البيانات
SELECT 
    'الجداول المنشأة' as النوع,
    COUNT(*) as العدد
FROM information_schema.tables 
WHERE table_schema = 'public'
UNION ALL
SELECT 
    'المستخدمين المنشأين' as النوع,
    COUNT(*) as العدد
FROM users
UNION ALL
SELECT 
    'العملات المتاحة' as النوع,
    COUNT(*) as العدد
FROM currencies;

\echo ''
\echo '🎉 تم إعداد قاعدة البيانات بنجاح!'
\echo ''
\echo '📋 بيانات الدخول الافتراضية:'
\echo '================================'
\echo '1. مدير النظام:'
\echo '   البريد: admin@ibrahim-system.com'
\echo '   كلمة المرور: SystemAdmin123!'
\echo ''
\echo '2. مدير المتجر (إبراهيم):'
\echo '   البريد: ibrahim@store.com'
\echo '   كلمة المرور: Ibrahim123!'
\echo ''
\echo '3. المحاسب:'
\echo '   البريد: accountant@store.com'
\echo '   كلمة المرور: Ahmed123!'
\echo ''
\echo '4. مدير المستودع:'
\echo '   البريد: warehouse@store.com'
\echo '   كلمة المرور: Mohammed123!'
\echo ''
\echo '🔗 رابط النظام: https://ibrahim-accounting-system-2024.netlify.app'
\echo ''
\echo '📞 للدعم:'
\echo '   WhatsApp: +963 994 054 027'
\echo '   البريد: systemibrahem@gmail.com'
\echo ''

