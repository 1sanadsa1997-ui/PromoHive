-- نظام إبراهيم للمحاسبة - المخطط الأساسي لقاعدة البيانات
-- Ibrahim Accounting System - Initial Database Schema

-- تفعيل Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret-here';

-- إنشاء جدول العملات
CREATE TABLE IF NOT EXISTS currencies (
    code VARCHAR(3) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    symbol VARCHAR(10) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إدراج العملات الأساسية
INSERT INTO currencies (code, name, symbol) VALUES 
('TRY', 'Turkish Lira', '₺'),
('SYP', 'Syrian Pound', 'ل.س'),
('USD', 'US Dollar', '$')
ON CONFLICT (code) DO NOTHING;

-- إنشاء جدول المتاجر (نظام متعدد المتاجر)
CREATE TABLE IF NOT EXISTS stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    owner_email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    default_currency VARCHAR(3) REFERENCES currencies(code) DEFAULT 'USD',
    subscription_status VARCHAR(20) DEFAULT 'trial', -- trial, active, expired, suspended
    subscription_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    subscription_end_date TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
    subscription_plan VARCHAR(20) DEFAULT 'monthly', -- monthly, semi_annual, annual
    is_active BOOLEAN DEFAULT true,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول المستخدمين
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'employee', -- system_owner, store_manager, accountant, data_entry, warehouse_manager, employee
    permissions JSONB DEFAULT '{}',
    phone VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    locale VARCHAR(10) DEFAULT 'ar',
    theme VARCHAR(20) DEFAULT 'light',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- إنشاء جدول سجل العمليات (Audit Log)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول الشركاء (العملاء والموردين)
CREATE TABLE IF NOT EXISTS partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('customer', 'vendor', 'both')),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    tax_number VARCHAR(100),
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- إنشاء جدول الواردات
CREATE TABLE IF NOT EXISTS invoices_in (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    invoice_number VARCHAR(100),
    amount DECIMAL(15,2) NOT NULL CHECK (amount >= 0),
    currency VARCHAR(3) REFERENCES currencies(code) NOT NULL,
    description TEXT NOT NULL,
    date DATE NOT NULL,
    vendor_id UUID REFERENCES partners(id),
    category VARCHAR(100),
    attachments JSONB DEFAULT '[]',
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE
);

-- إنشاء جدول الصادرات
CREATE TABLE IF NOT EXISTS invoices_out (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    invoice_number VARCHAR(100),
    amount DECIMAL(15,2) NOT NULL CHECK (amount >= 0),
    currency VARCHAR(3) REFERENCES currencies(code) NOT NULL,
    description TEXT NOT NULL,
    date DATE NOT NULL,
    customer_id UUID REFERENCES partners(id),
    category VARCHAR(100),
    attachments JSONB DEFAULT '[]',
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE
);

-- إنشاء جدول المنتجات
CREATE TABLE IF NOT EXISTS inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    sku VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    unit VARCHAR(50) NOT NULL DEFAULT 'piece',
    current_stock DECIMAL(10,2) DEFAULT 0,
    min_stock DECIMAL(10,2) DEFAULT 0,
    price DECIMAL(15,2) DEFAULT 0,
    currency VARCHAR(3) REFERENCES currencies(code) DEFAULT 'USD',
    category VARCHAR(100),
    location VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    UNIQUE(store_id, sku)
);

-- إنشاء جدول حركات المخزون
CREATE TABLE IF NOT EXISTS inventory_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('in', 'out', 'adjustment')),
    quantity DECIMAL(10,2) NOT NULL,
    unit_price DECIMAL(15,2),
    total_value DECIMAL(15,2),
    currency VARCHAR(3) REFERENCES currencies(code),
    reference_type VARCHAR(50), -- invoice_in, invoice_out, adjustment
    reference_id UUID,
    notes TEXT,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- إنشاء جدول الموظفين
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    employee_number VARCHAR(100),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    position VARCHAR(100),
    department VARCHAR(100),
    base_salary DECIMAL(15,2) NOT NULL DEFAULT 0,
    currency VARCHAR(3) REFERENCES currencies(code) DEFAULT 'USD',
    hire_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'active', -- active, inactive, terminated
    bank_account VARCHAR(100),
    national_id VARCHAR(100),
    address TEXT,
    emergency_contact JSONB,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    UNIQUE(store_id, employee_number)
);

-- إنشاء جدول معاملات الموظفين (السلف، الغياب، الخصومات، المكافآت)
CREATE TABLE IF NOT EXISTS employee_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('advance', 'absence', 'deduction', 'bonus', 'overtime')),
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) REFERENCES currencies(code) NOT NULL,
    description TEXT NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE
);

-- إنشاء جدول كشوف الرواتب
CREATE TABLE IF NOT EXISTS payroll (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    period_month INTEGER NOT NULL CHECK (period_month BETWEEN 1 AND 12),
    period_year INTEGER NOT NULL CHECK (period_year > 2020),
    base_salary DECIMAL(15,2) NOT NULL,
    total_advances DECIMAL(15,2) DEFAULT 0,
    total_deductions DECIMAL(15,2) DEFAULT 0,
    total_bonuses DECIMAL(15,2) DEFAULT 0,
    total_overtime DECIMAL(15,2) DEFAULT 0,
    gross_salary DECIMAL(15,2) NOT NULL,
    net_salary DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) REFERENCES currencies(code) NOT NULL,
    status VARCHAR(20) DEFAULT 'draft', -- draft, approved, paid
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    paid_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(store_id, employee_id, period_month, period_year)
);

-- إنشاء جدول التنبيهات
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- low_stock, overdue_invoice, subscription_expiry, etc.
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    severity VARCHAR(20) DEFAULT 'info', -- info, warning, error, critical
    entity_type VARCHAR(100),
    entity_id UUID,
    is_read BOOLEAN DEFAULT false,
    is_dismissed BOOLEAN DEFAULT false,
    target_user_id UUID REFERENCES users(id),
    target_role VARCHAR(50),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول الإعدادات
CREATE TABLE IF NOT EXISTS settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    key VARCHAR(100) NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    is_system BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(store_id, category, key)
);

-- إنشاء الفهارس للأداء
CREATE INDEX IF NOT EXISTS idx_users_store_id ON users(store_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

CREATE INDEX IF NOT EXISTS idx_audit_logs_store_id ON audit_logs(store_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_partners_store_id ON partners(store_id);
CREATE INDEX IF NOT EXISTS idx_partners_type ON partners(type);

CREATE INDEX IF NOT EXISTS idx_invoices_in_store_id ON invoices_in(store_id);
CREATE INDEX IF NOT EXISTS idx_invoices_in_date ON invoices_in(date);
CREATE INDEX IF NOT EXISTS idx_invoices_in_currency ON invoices_in(currency);
CREATE INDEX IF NOT EXISTS idx_invoices_in_vendor ON invoices_in(vendor_id);

CREATE INDEX IF NOT EXISTS idx_invoices_out_store_id ON invoices_out(store_id);
CREATE INDEX IF NOT EXISTS idx_invoices_out_date ON invoices_out(date);
CREATE INDEX IF NOT EXISTS idx_invoices_out_currency ON invoices_out(currency);
CREATE INDEX IF NOT EXISTS idx_invoices_out_customer ON invoices_out(customer_id);

CREATE INDEX IF NOT EXISTS idx_inventory_items_store_id ON inventory_items(store_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_sku ON inventory_items(sku);

CREATE INDEX IF NOT EXISTS idx_inventory_movements_store_id ON inventory_movements(store_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_item_id ON inventory_movements(item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_date ON inventory_movements(date);

CREATE INDEX IF NOT EXISTS idx_employees_store_id ON employees(store_id);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);

CREATE INDEX IF NOT EXISTS idx_employee_transactions_store_id ON employee_transactions(store_id);
CREATE INDEX IF NOT EXISTS idx_employee_transactions_employee_id ON employee_transactions(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_transactions_date ON employee_transactions(date);

CREATE INDEX IF NOT EXISTS idx_payroll_store_id ON payroll(store_id);
CREATE INDEX IF NOT EXISTS idx_payroll_employee_id ON payroll(employee_id);
CREATE INDEX IF NOT EXISTS idx_payroll_period ON payroll(period_year, period_month);

CREATE INDEX IF NOT EXISTS idx_alerts_store_id ON alerts(store_id);
CREATE INDEX IF NOT EXISTS idx_alerts_target_user ON alerts(target_user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_is_read ON alerts(is_read);

CREATE INDEX IF NOT EXISTS idx_settings_store_id ON settings(store_id);
CREATE INDEX IF NOT EXISTS idx_settings_category ON settings(category);

-- إنشاء فهارس مركبة للأداء
CREATE INDEX IF NOT EXISTS idx_invoices_in_store_date_currency ON invoices_in(store_id, date, currency);
CREATE INDEX IF NOT EXISTS idx_invoices_out_store_date_currency ON invoices_out(store_id, date, currency);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_store_item_date ON inventory_movements(store_id, item_id, date);
CREATE INDEX IF NOT EXISTS idx_employee_transactions_store_employee_date ON employee_transactions(store_id, employee_id, date);
