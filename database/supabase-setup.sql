-- نظام إبراهيم للمحاسبة - الإعداد المبسط لـ Supabase
-- Ibrahim Accounting System - Simplified Supabase Setup

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

-- جدول سجل النشاطات
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    metadata JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول الشركاء (العملاء والموردين)
CREATE TABLE IF NOT EXISTS partners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(10) NOT NULL CHECK (type IN ('customer', 'vendor')),
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول الفواتير الواردة
CREATE TABLE IF NOT EXISTS invoices_in (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    invoice_number VARCHAR(50) NOT NULL,
    vendor_id UUID REFERENCES partners(id),
    amount DECIMAL(15,2) NOT NULL CHECK (amount >= 0),
    currency VARCHAR(3) NOT NULL REFERENCES currencies(code),
    description TEXT NOT NULL,
    category VARCHAR(50),
    date DATE NOT NULL,
    due_date DATE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
    attachments JSONB DEFAULT '[]',
    notes TEXT,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(store_owner_id, invoice_number)
);

-- جدول الفواتير الصادرة
CREATE TABLE IF NOT EXISTS invoices_out (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    invoice_number VARCHAR(50) NOT NULL,
    customer_id UUID REFERENCES partners(id),
    amount DECIMAL(15,2) NOT NULL CHECK (amount >= 0),
    currency VARCHAR(3) NOT NULL REFERENCES currencies(code),
    description TEXT NOT NULL,
    category VARCHAR(50),
    date DATE NOT NULL,
    due_date DATE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
    attachments JSONB DEFAULT '[]',
    notes TEXT,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(store_owner_id, invoice_number)
);

-- جدول المنتجات والمخزون
CREATE TABLE IF NOT EXISTS inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sku VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    unit VARCHAR(20) NOT NULL,
    min_stock INTEGER DEFAULT 0 CHECK (min_stock >= 0),
    current_stock INTEGER DEFAULT 0 CHECK (current_stock >= 0),
    price DECIMAL(15,2) CHECK (price >= 0),
    currency VARCHAR(3) REFERENCES currencies(code),
    category VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(store_owner_id, sku)
);

-- جدول حركات المخزون
CREATE TABLE IF NOT EXISTS inventory_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
    type VARCHAR(10) NOT NULL CHECK (type IN ('in', 'out', 'adjustment')),
    quantity INTEGER NOT NULL CHECK (quantity != 0),
    unit_price DECIMAL(15,2) CHECK (unit_price >= 0),
    total_value DECIMAL(15,2),
    currency VARCHAR(3) REFERENCES currencies(code),
    related_invoice_id UUID,
    date DATE NOT NULL,
    notes TEXT,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول الموظفين
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    employee_number VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    position VARCHAR(50),
    department VARCHAR(50),
    base_salary DECIMAL(15,2) NOT NULL CHECK (base_salary >= 0),
    currency VARCHAR(3) NOT NULL REFERENCES currencies(code),
    hire_date DATE NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'terminated')),
    notes TEXT,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(store_owner_id, employee_number)
);

-- جدول معاملات الموظفين (السلف، الخصومات، المكافآت)
CREATE TABLE IF NOT EXISTS employee_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('advance', 'absence', 'deduction', 'bonus', 'overtime')),
    amount DECIMAL(15,2) NOT NULL CHECK (amount >= 0),
    currency VARCHAR(3) NOT NULL REFERENCES currencies(code),
    date DATE NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول كشوف الرواتب
CREATE TABLE IF NOT EXISTS payroll (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    period_month INTEGER NOT NULL CHECK (period_month BETWEEN 1 AND 12),
    period_year INTEGER NOT NULL CHECK (period_year >= 2020),
    gross_salary DECIMAL(15,2) NOT NULL CHECK (gross_salary >= 0),
    total_advances DECIMAL(15,2) DEFAULT 0 CHECK (total_advances >= 0),
    total_absences DECIMAL(15,2) DEFAULT 0 CHECK (total_absences >= 0),
    total_deductions DECIMAL(15,2) DEFAULT 0 CHECK (total_deductions >= 0),
    total_bonuses DECIMAL(15,2) DEFAULT 0 CHECK (total_bonuses >= 0),
    total_overtime DECIMAL(15,2) DEFAULT 0 CHECK (total_overtime >= 0),
    net_salary DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) NOT NULL REFERENCES currencies(code),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'paid')),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    paid_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(store_owner_id, employee_id, period_month, period_year)
);

-- جدول التنبيهات
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    type VARCHAR(30) NOT NULL CHECK (type IN ('low_stock', 'overdue_invoice', 'subscription_expiry', 'employee_birthday', 'system_notification')),
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    is_read BOOLEAN DEFAULT false,
    action_url VARCHAR(500),
    metadata JSONB DEFAULT '{}',
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول الإعدادات
CREATE TABLE IF NOT EXISTS settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    key VARCHAR(100) NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(store_owner_id, key)
);

-- إدراج العملات الأساسية
INSERT INTO currencies (code, name, symbol) VALUES
('TRY', 'الليرة التركية', '₺'),
('SYP', 'الليرة السورية', 'ل.س'),
('USD', 'الدولار الأمريكي', '$'),
('EUR', 'اليورو', '€')
ON CONFLICT (code) DO NOTHING;

-- إنشاء مدير النظام الرئيسي
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
    '$2b$10$rQZ8kHp.TB.It.NE.Lgs4OLjVKVK8rQZ8kHp.TB.It.NE.Lgs4OLjVK',
    'system_admin',
    'إدارة النظام',
    'annual',
    '2030-12-31 23:59:59+00',
    true,
    'ar'
) ON CONFLICT (email) DO NOTHING;

-- إنشاء مدير متجر إبراهيم
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
    '$2b$10$rQZ8kHp.TB.It.NE.Lgs4OLjVKVK8rQZ8kHp.TB.It.NE.Lgs4OLjVK',
    'store_owner',
    'متجر إبراهيم التجاري',
    'trial',
    NOW() + INTERVAL '30 days',
    true,
    'ar'
) ON CONFLICT (email) DO NOTHING;

-- إنشاء محاسب للمتجر
INSERT INTO users (
    id,
    name, 
    email, 
    username,
    password_hash, 
    role, 
    store_name,
    store_owner_id,
    subscription_plan,
    subscription_expires_at,
    is_active,
    locale
) VALUES (
    '22222222-2222-2222-2222-222222222222',
    'أحمد المحاسب',
    'accountant@store.com',
    'ahmed_accountant',
    '$2b$10$rQZ8kHp.TB.It.NE.Lgs4OLjVKVK8rQZ8kHp.TB.It.NE.Lgs4OLjVK',
    'accountant',
    'متجر إبراهيم التجاري',
    '11111111-1111-1111-1111-111111111111',
    'trial',
    NOW() + INTERVAL '30 days',
    true,
    'ar'
) ON CONFLICT (email) DO NOTHING;

-- إنشاء مدير مستودع
INSERT INTO users (
    id,
    name, 
    email, 
    username,
    password_hash, 
    role, 
    store_name,
    store_owner_id,
    subscription_plan,
    subscription_expires_at,
    is_active,
    locale
) VALUES (
    '33333333-3333-3333-3333-333333333333',
    'محمد مدير المستودع',
    'warehouse@store.com',
    'mohammed_warehouse',
    '$2b$10$rQZ8kHp.TB.It.NE.Lgs4OLjVKVK8rQZ8kHp.TB.It.NE.Lgs4OLjVK',
    'warehouse_manager',
    'متجر إبراهيم التجاري',
    '11111111-1111-1111-1111-111111111111',
    'trial',
    NOW() + INTERVAL '30 days',
    true,
    'ar'
) ON CONFLICT (email) DO NOTHING;

