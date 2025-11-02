-- نظام إبراهيم للمحاسبة - المخطط الأساسي لقاعدة البيانات
-- Ibrahim Accounting System - Initial Database Schema

-- إنشاء امتداد UUID إذا لم يكن موجوداً
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- جدول العملات المدعومة
-- Supported Currencies Table
CREATE TABLE currencies (
    code VARCHAR(3) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    symbol VARCHAR(10) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول المتاجر
-- Stores Table
CREATE TABLE stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    owner_email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    default_currency VARCHAR(3) DEFAULT 'USD' REFERENCES currencies(code),
    
    -- معلومات الاشتراك
    subscription_status VARCHAR(20) DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'expired', 'cancelled')),
    subscription_plan VARCHAR(20) DEFAULT 'monthly' CHECK (subscription_plan IN ('monthly', 'semi_annual', 'annual')),
    subscription_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    subscription_end_date TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
    
    -- حالة المتجر
    is_active BOOLEAN DEFAULT true,
    
    -- تواريخ الإنشاء والتحديث
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول المستخدمين
-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    
    -- معلومات المصادقة
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    
    -- معلومات شخصية
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    
    -- الدور والصلاحيات
    role VARCHAR(50) DEFAULT 'employee' CHECK (role IN ('system_owner', 'store_manager', 'accountant', 'warehouse_manager', 'employee')),
    permissions JSONB DEFAULT '{}',
    
    -- إعدادات المستخدم
    locale VARCHAR(5) DEFAULT 'ar',
    theme VARCHAR(10) DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
    
    -- حالة المستخدم
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    
    -- معلومات الإنشاء
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول سجل العمليات (Audit Log)
-- Audit Logs Table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- تفاصيل العملية
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID,
    
    -- البيانات
    old_data JSONB,
    new_data JSONB,
    
    -- معلومات إضافية
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول الشركاء (العملاء والموردين)
-- Partners Table (Customers and Vendors)
CREATE TABLE partners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    
    -- نوع الشريك
    type VARCHAR(20) NOT NULL CHECK (type IN ('customer', 'vendor', 'both')),
    
    -- معلومات الشريك
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    tax_number VARCHAR(50),
    
    -- معلومات مالية
    credit_limit DECIMAL(15,2) DEFAULT 0,
    current_balance DECIMAL(15,2) DEFAULT 0,
    
    -- ملاحظات
    notes TEXT,
    
    -- حالة الشريك
    is_active BOOLEAN DEFAULT true,
    
    -- معلومات الإنشاء
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول الفواتير الواردة (المبيعات)
-- Incoming Invoices Table (Sales)
CREATE TABLE invoices_in (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    
    -- رقم الفاتورة
    invoice_number VARCHAR(100) NOT NULL,
    
    -- معلومات العميل
    customer_id UUID REFERENCES partners(id),
    customer_name VARCHAR(255),
    
    -- معلومات مالية
    amount DECIMAL(15,2) NOT NULL CHECK (amount >= 0),
    currency VARCHAR(3) NOT NULL REFERENCES currencies(code),
    tax_amount DECIMAL(15,2) DEFAULT 0,
    discount_amount DECIMAL(15,2) DEFAULT 0,
    total_amount DECIMAL(15,2) GENERATED ALWAYS AS (amount + tax_amount - discount_amount) STORED,
    
    -- تفاصيل الفاتورة
    description TEXT NOT NULL,
    category VARCHAR(100),
    payment_method VARCHAR(50),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'partial', 'overdue')),
    
    -- التواريخ
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE,
    payment_date DATE,
    
    -- المرفقات
    attachments JSONB DEFAULT '[]',
    
    -- ملاحظات
    notes TEXT,
    
    -- معلومات الإنشاء
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- فهرس فريد لرقم الفاتورة في المتجر
    UNIQUE(store_id, invoice_number)
);

-- جدول الفواتير الصادرة (المشتريات)
-- Outgoing Invoices Table (Purchases)
CREATE TABLE invoices_out (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    
    -- رقم الفاتورة
    invoice_number VARCHAR(100) NOT NULL,
    
    -- معلومات المورد
    vendor_id UUID REFERENCES partners(id),
    vendor_name VARCHAR(255),
    
    -- معلومات مالية
    amount DECIMAL(15,2) NOT NULL CHECK (amount >= 0),
    currency VARCHAR(3) NOT NULL REFERENCES currencies(code),
    tax_amount DECIMAL(15,2) DEFAULT 0,
    discount_amount DECIMAL(15,2) DEFAULT 0,
    total_amount DECIMAL(15,2) GENERATED ALWAYS AS (amount + tax_amount - discount_amount) STORED,
    
    -- تفاصيل الفاتورة
    description TEXT NOT NULL,
    category VARCHAR(100),
    payment_method VARCHAR(50),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'partial', 'overdue')),
    
    -- التواريخ
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE,
    payment_date DATE,
    
    -- المرفقات
    attachments JSONB DEFAULT '[]',
    
    -- ملاحظات
    notes TEXT,
    
    -- معلومات الإنشاء
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- فهرس فريد لرقم الفاتورة في المتجر
    UNIQUE(store_id, invoice_number)
);

-- جدول عناصر المستودع
-- Inventory Items Table
CREATE TABLE inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    
    -- معلومات المنتج
    sku VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    
    -- معلومات الوحدة والسعر
    unit VARCHAR(50) NOT NULL DEFAULT 'piece',
    cost_price DECIMAL(15,2) DEFAULT 0,
    selling_price DECIMAL(15,2) DEFAULT 0,
    currency VARCHAR(3) NOT NULL REFERENCES currencies(code),
    
    -- معلومات المخزون
    current_stock DECIMAL(15,3) DEFAULT 0,
    min_stock DECIMAL(15,3) DEFAULT 0,
    max_stock DECIMAL(15,3),
    reorder_point DECIMAL(15,3),
    
    -- معلومات إضافية
    barcode VARCHAR(100),
    location VARCHAR(100),
    supplier_id UUID REFERENCES partners(id),
    
    -- حالة المنتج
    is_active BOOLEAN DEFAULT true,
    
    -- ملاحظات
    notes TEXT,
    
    -- معلومات الإنشاء
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- فهرس فريد للـ SKU في المتجر
    UNIQUE(store_id, sku)
);

-- جدول حركات المستودع
-- Inventory Movements Table
CREATE TABLE inventory_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
    
    -- نوع الحركة
    movement_type VARCHAR(20) NOT NULL CHECK (movement_type IN ('in', 'out', 'adjustment', 'transfer')),
    
    -- الكمية والسعر
    quantity DECIMAL(15,3) NOT NULL,
    unit_cost DECIMAL(15,2) DEFAULT 0,
    total_cost DECIMAL(15,2) GENERATED ALWAYS AS (quantity * unit_cost) STORED,
    
    -- المرجع
    reference_type VARCHAR(50), -- 'invoice_in', 'invoice_out', 'adjustment', etc.
    reference_id UUID,
    
    -- تفاصيل الحركة
    description TEXT,
    batch_number VARCHAR(100),
    expiry_date DATE,
    
    -- التاريخ
    movement_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- ملاحظات
    notes TEXT,
    
    -- معلومات الإنشاء
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول الموظفين
-- Employees Table
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id), -- ربط بحساب المستخدم إذا كان له حساب
    
    -- معلومات شخصية
    employee_number VARCHAR(50) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    national_id VARCHAR(50),
    
    -- معلومات الوظيفة
    position VARCHAR(100),
    department VARCHAR(100),
    hire_date DATE NOT NULL,
    termination_date DATE,
    
    -- معلومات الراتب
    base_salary DECIMAL(15,2) NOT NULL DEFAULT 0,
    currency VARCHAR(3) NOT NULL REFERENCES currencies(code),
    salary_type VARCHAR(20) DEFAULT 'monthly' CHECK (salary_type IN ('hourly', 'daily', 'monthly', 'annual')),
    
    -- معلومات إضافية
    bank_account VARCHAR(100),
    emergency_contact VARCHAR(255),
    emergency_phone VARCHAR(20),
    
    -- حالة الموظف
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'terminated')),
    
    -- ملاحظات
    notes TEXT,
    
    -- معلومات الإنشاء
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- فهرس فريد لرقم الموظف في المتجر
    UNIQUE(store_id, employee_number)
);

-- جدول معاملات الموظفين (السلف، الخصومات، المكافآت)
-- Employee Transactions Table
CREATE TABLE employee_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    
    -- نوع المعاملة
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('advance', 'deduction', 'bonus', 'overtime', 'absence')),
    
    -- المبلغ والعملة
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) NOT NULL REFERENCES currencies(code),
    
    -- تفاصيل المعاملة
    description TEXT NOT NULL,
    reference_number VARCHAR(100),
    
    -- التاريخ
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- حالة المعاملة
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),
    
    -- معلومات الاعتماد
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    
    -- ملاحظات
    notes TEXT,
    
    -- معلومات الإنشاء
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول كشوف الرواتب
-- Payroll Table
CREATE TABLE payroll (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    
    -- فترة الراتب
    period_month INTEGER NOT NULL CHECK (period_month BETWEEN 1 AND 12),
    period_year INTEGER NOT NULL CHECK (period_year > 2020),
    
    -- تفاصيل الراتب
    base_salary DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) NOT NULL REFERENCES currencies(code),
    
    -- الإضافات
    overtime_amount DECIMAL(15,2) DEFAULT 0,
    bonus_amount DECIMAL(15,2) DEFAULT 0,
    allowances_amount DECIMAL(15,2) DEFAULT 0,
    
    -- الخصومات
    advance_amount DECIMAL(15,2) DEFAULT 0,
    deduction_amount DECIMAL(15,2) DEFAULT 0,
    absence_amount DECIMAL(15,2) DEFAULT 0,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    insurance_amount DECIMAL(15,2) DEFAULT 0,
    
    -- الإجماليات
    gross_salary DECIMAL(15,2) GENERATED ALWAYS AS (base_salary + overtime_amount + bonus_amount + allowances_amount) STORED,
    total_deductions DECIMAL(15,2) GENERATED ALWAYS AS (advance_amount + deduction_amount + absence_amount + tax_amount + insurance_amount) STORED,
    net_salary DECIMAL(15,2) GENERATED ALWAYS AS (base_salary + overtime_amount + bonus_amount + allowances_amount - advance_amount - deduction_amount - absence_amount - tax_amount - insurance_amount) STORED,
    
    -- حالة كشف الراتب
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'paid')),
    
    -- معلومات الاعتماد والدفع
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    paid_by UUID REFERENCES users(id),
    paid_at TIMESTAMP WITH TIME ZONE,
    payment_method VARCHAR(50),
    
    -- ملاحظات
    notes TEXT,
    
    -- معلومات الإنشاء
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- فهرس فريد لكشف راتب الموظف في الشهر
    UNIQUE(store_id, employee_id, period_month, period_year)
);

-- جدول التنبيهات
-- Alerts Table
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    
    -- نوع التنبيه
    type VARCHAR(50) NOT NULL,
    
    -- محتوى التنبيه
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    severity VARCHAR(20) DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'success')),
    
    -- الهدف
    target_user_id UUID REFERENCES users(id),
    target_role VARCHAR(50),
    
    -- حالة التنبيه
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    read_by UUID REFERENCES users(id),
    
    -- تاريخ انتهاء الصلاحية
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- معلومات إضافية
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول الإعدادات
-- Settings Table
CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    
    -- مفتاح الإعداد
    setting_key VARCHAR(100) NOT NULL,
    setting_value JSONB NOT NULL,
    
    -- وصف الإعداد
    description TEXT,
    
    -- نوع الإعداد
    setting_type VARCHAR(50) DEFAULT 'general',
    
    -- معلومات التحديث
    updated_by UUID NOT NULL REFERENCES users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- فهرس فريد للإعداد في المتجر
    UNIQUE(store_id, setting_key)
);

-- إنشاء الفهارس للأداء
-- Create Performance Indexes

-- فهارس المستخدمين
CREATE INDEX idx_users_store_id ON users(store_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);

-- فهارس سجل العمليات
CREATE INDEX idx_audit_logs_store_id ON audit_logs(store_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

-- فهارس الشركاء
CREATE INDEX idx_partners_store_id ON partners(store_id);
CREATE INDEX idx_partners_type ON partners(type);
CREATE INDEX idx_partners_name ON partners(name);

-- فهارس الفواتير الواردة
CREATE INDEX idx_invoices_in_store_id ON invoices_in(store_id);
CREATE INDEX idx_invoices_in_customer_id ON invoices_in(customer_id);
CREATE INDEX idx_invoices_in_invoice_date ON invoices_in(invoice_date);
CREATE INDEX idx_invoices_in_currency ON invoices_in(currency);
CREATE INDEX idx_invoices_in_payment_status ON invoices_in(payment_status);
CREATE INDEX idx_invoices_in_created_at ON invoices_in(created_at);

-- فهارس الفواتير الصادرة
CREATE INDEX idx_invoices_out_store_id ON invoices_out(store_id);
CREATE INDEX idx_invoices_out_vendor_id ON invoices_out(vendor_id);
CREATE INDEX idx_invoices_out_invoice_date ON invoices_out(invoice_date);
CREATE INDEX idx_invoices_out_currency ON invoices_out(currency);
CREATE INDEX idx_invoices_out_payment_status ON invoices_out(payment_status);
CREATE INDEX idx_invoices_out_created_at ON invoices_out(created_at);

-- فهارس المستودع
CREATE INDEX idx_inventory_items_store_id ON inventory_items(store_id);
CREATE INDEX idx_inventory_items_sku ON inventory_items(sku);
CREATE INDEX idx_inventory_items_category ON inventory_items(category);
CREATE INDEX idx_inventory_items_current_stock ON inventory_items(current_stock);

-- فهارس حركات المستودع
CREATE INDEX idx_inventory_movements_store_id ON inventory_movements(store_id);
CREATE INDEX idx_inventory_movements_item_id ON inventory_movements(item_id);
CREATE INDEX idx_inventory_movements_movement_date ON inventory_movements(movement_date);
CREATE INDEX idx_inventory_movements_movement_type ON inventory_movements(movement_type);

-- فهارس الموظفين
CREATE INDEX idx_employees_store_id ON employees(store_id);
CREATE INDEX idx_employees_employee_number ON employees(employee_number);
CREATE INDEX idx_employees_status ON employees(status);

-- فهارس معاملات الموظفين
CREATE INDEX idx_employee_transactions_store_id ON employee_transactions(store_id);
CREATE INDEX idx_employee_transactions_employee_id ON employee_transactions(employee_id);
CREATE INDEX idx_employee_transactions_transaction_date ON employee_transactions(transaction_date);
CREATE INDEX idx_employee_transactions_type ON employee_transactions(transaction_type);

-- فهارس كشوف الرواتب
CREATE INDEX idx_payroll_store_id ON payroll(store_id);
CREATE INDEX idx_payroll_employee_id ON payroll(employee_id);
CREATE INDEX idx_payroll_period ON payroll(period_year, period_month);
CREATE INDEX idx_payroll_status ON payroll(status);

-- فهارس التنبيهات
CREATE INDEX idx_alerts_store_id ON alerts(store_id);
CREATE INDEX idx_alerts_target_user_id ON alerts(target_user_id);
CREATE INDEX idx_alerts_type ON alerts(type);
CREATE INDEX idx_alerts_is_read ON alerts(is_read);
CREATE INDEX idx_alerts_created_at ON alerts(created_at);

-- فهارس الإعدادات
CREATE INDEX idx_settings_store_id ON settings(store_id);
CREATE INDEX idx_settings_key ON settings(setting_key);
