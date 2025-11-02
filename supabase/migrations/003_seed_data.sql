-- نظام إبراهيم للمحاسبة - البيانات التجريبية
-- Ibrahim Accounting System - Seed Data

-- إدراج العملات المدعومة
-- Insert supported currencies
INSERT INTO currencies (code, name, symbol) VALUES
('SYP', 'الليرة السورية', 'ل.س'),
('USD', 'الدولار الأمريكي', '$'),
('TRY', 'الليرة التركية', '₺'),
('EUR', 'اليورو', '€'),
('GBP', 'الجنيه الإسترليني', '£');

-- إنشاء متجر تجريبي
-- Create demo store
INSERT INTO stores (
    id,
    name,
    description,
    owner_email,
    phone,
    address,
    default_currency,
    subscription_status,
    subscription_plan,
    subscription_start_date,
    subscription_end_date
) VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'متجر إبراهيم التجريبي',
    'متجر تجريبي لاختبار نظام إبراهيم للمحاسبة',
    'demo@ibrahim-accounting.com',
    '+963994054027',
    'دمشق، سوريا',
    'SYP',
    'trial',
    'monthly',
    NOW(),
    NOW() + INTERVAL '30 days'
);

-- إنشاء مستخدمين تجريبيين
-- Create demo users
INSERT INTO users (
    id,
    store_id,
    email,
    username,
    password_hash,
    full_name,
    phone,
    role,
    permissions,
    locale,
    theme
) VALUES 
-- مدير المتجر
(
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440000',
    'manager@ibrahim-accounting.com',
    'manager',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6hsxq5S/kS', -- password: manager123
    'إبراهيم أحمد - مدير المتجر',
    '+963994054027',
    'store_manager',
    '{"all": true}',
    'ar',
    'light'
),
-- محاسب
(
    '550e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440000',
    'accountant@ibrahim-accounting.com',
    'accountant',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6hsxq5S/kS', -- password: accountant123
    'فاطمة محمد - محاسبة',
    '+963994054028',
    'accountant',
    '{"invoices": {"create": true, "read": true, "update": true}, "partners": {"create": true, "read": true, "update": true}, "reports": {"read": true}}',
    'ar',
    'light'
),
-- مراقب مستودع
(
    '550e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440000',
    'warehouse@ibrahim-accounting.com',
    'warehouse',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6hsxq5S/kS', -- password: warehouse123
    'أحمد علي - مراقب مستودع',
    '+963994054029',
    'warehouse_manager',
    '{"inventory": {"create": true, "read": true, "update": true}, "reports": {"read": true}}',
    'ar',
    'light'
);

-- إنشاء شركاء تجريبيين (عملاء وموردين)
-- Create demo partners
INSERT INTO partners (
    id,
    store_id,
    type,
    name,
    email,
    phone,
    address,
    tax_number,
    credit_limit,
    current_balance,
    notes,
    created_by
) VALUES 
-- عملاء
(
    '550e8400-e29b-41d4-a716-446655440010',
    '550e8400-e29b-41d4-a716-446655440000',
    'customer',
    'شركة الأمل للتجارة',
    'amal@company.com',
    '+963994054030',
    'حلب، سوريا',
    'TAX001',
    500000.00,
    0.00,
    'عميل مميز - دفع نقدي',
    '550e8400-e29b-41d4-a716-446655440001'
),
(
    '550e8400-e29b-41d4-a716-446655440011',
    '550e8400-e29b-41d4-a716-446655440000',
    'customer',
    'محمد أحمد للإلكترونيات',
    'mohamed@electronics.com',
    '+963994054031',
    'دمشق، سوريا',
    'TAX002',
    300000.00,
    50000.00,
    'عميل منتظم',
    '550e8400-e29b-41d4-a716-446655440001'
),
-- موردين
(
    '550e8400-e29b-41d4-a716-446655440012',
    '550e8400-e29b-41d4-a716-446655440000',
    'vendor',
    'شركة التقنية المتقدمة',
    'tech@advanced.com',
    '+963994054032',
    'دمشق، سوريا',
    'TAX003',
    0.00,
    -25000.00,
    'مورد أجهزة كمبيوتر',
    '550e8400-e29b-41d4-a716-446655440001'
),
(
    '550e8400-e29b-41d4-a716-446655440013',
    '550e8400-e29b-41d4-a716-446655440000',
    'vendor',
    'مؤسسة النور للمواد المكتبية',
    'nour@office.com',
    '+963994054033',
    'حمص، سوريا',
    'TAX004',
    0.00,
    -15000.00,
    'مورد مواد مكتبية',
    '550e8400-e29b-41d4-a716-446655440001'
);

-- إنشاء منتجات تجريبية
-- Create demo inventory items
INSERT INTO inventory_items (
    id,
    store_id,
    sku,
    name,
    description,
    category,
    unit,
    cost_price,
    selling_price,
    currency,
    current_stock,
    min_stock,
    max_stock,
    reorder_point,
    barcode,
    location,
    supplier_id,
    created_by
) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440020',
    '550e8400-e29b-41d4-a716-446655440000',
    'LAPTOP-DELL-001',
    'لابتوب ديل انسبايرون 15',
    'لابتوب ديل انسبايرون 15 - معالج i5 - ذاكرة 8GB - قرص صلب 512GB SSD',
    'أجهزة كمبيوتر',
    'قطعة',
    650000.00,
    850000.00,
    'SYP',
    5.000,
    2.000,
    20.000,
    3.000,
    '1234567890123',
    'المستودع الرئيسي - رف A1',
    '550e8400-e29b-41d4-a716-446655440012',
    '550e8400-e29b-41d4-a716-446655440003'
),
(
    '550e8400-e29b-41d4-a716-446655440021',
    '550e8400-e29b-41d4-a716-446655440000',
    'MOUSE-WIRELESS-001',
    'ماوس لاسلكي لوجيتك',
    'ماوس لاسلكي لوجيتك M705 - بطارية طويلة المدى',
    'ملحقات كمبيوتر',
    'قطعة',
    25000.00,
    45000.00,
    'SYP',
    15.000,
    5.000,
    50.000,
    8.000,
    '1234567890124',
    'المستودع الرئيسي - رف B2',
    '550e8400-e29b-41d4-a716-446655440012',
    '550e8400-e29b-41d4-a716-446655440003'
),
(
    '550e8400-e29b-41d4-a716-446655440022',
    '550e8400-e29b-41d4-a716-446655440000',
    'PAPER-A4-001',
    'ورق A4 أبيض',
    'ورق A4 أبيض عالي الجودة - 500 ورقة',
    'مواد مكتبية',
    'علبة',
    8000.00,
    15000.00,
    'SYP',
    25.000,
    10.000,
    100.000,
    15.000,
    '1234567890125',
    'المستودع الرئيسي - رف C1',
    '550e8400-e29b-41d4-a716-446655440013',
    '550e8400-e29b-41d4-a716-446655440003'
);

-- إنشاء فواتير واردة تجريبية (مبيعات)
-- Create demo incoming invoices (sales)
INSERT INTO invoices_in (
    id,
    store_id,
    invoice_number,
    customer_id,
    customer_name,
    amount,
    currency,
    tax_amount,
    discount_amount,
    description,
    category,
    payment_method,
    payment_status,
    invoice_date,
    due_date,
    payment_date,
    notes,
    created_by
) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440030',
    '550e8400-e29b-41d4-a716-446655440000',
    'INV-IN-001',
    '550e8400-e29b-41d4-a716-446655440010',
    'شركة الأمل للتجارة',
    850000.00,
    'SYP',
    0.00,
    50000.00,
    'بيع لابتوب ديل انسبايرون 15',
    'مبيعات أجهزة',
    'نقدي',
    'paid',
    CURRENT_DATE - INTERVAL '5 days',
    CURRENT_DATE - INTERVAL '5 days',
    CURRENT_DATE - INTERVAL '5 days',
    'تم الدفع نقداً',
    '550e8400-e29b-41d4-a716-446655440002'
),
(
    '550e8400-e29b-41d4-a716-446655440031',
    '550e8400-e29b-41d4-a716-446655440000',
    'INV-IN-002',
    '550e8400-e29b-41d4-a716-446655440011',
    'محمد أحمد للإلكترونيات',
    135000.00,
    'SYP',
    0.00,
    0.00,
    'بيع 3 ماوس لاسلكي لوجيتك',
    'مبيعات ملحقات',
    'آجل',
    'pending',
    CURRENT_DATE - INTERVAL '2 days',
    CURRENT_DATE + INTERVAL '28 days',
    NULL,
    'دفع آجل - 30 يوم',
    '550e8400-e29b-41d4-a716-446655440002'
);

-- إنشاء فواتير صادرة تجريبية (مشتريات)
-- Create demo outgoing invoices (purchases)
INSERT INTO invoices_out (
    id,
    store_id,
    invoice_number,
    vendor_id,
    vendor_name,
    amount,
    currency,
    tax_amount,
    discount_amount,
    description,
    category,
    payment_method,
    payment_status,
    invoice_date,
    due_date,
    payment_date,
    notes,
    created_by
) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440040',
    '550e8400-e29b-41d4-a716-446655440000',
    'INV-OUT-001',
    '550e8400-e29b-41d4-a716-446655440012',
    'شركة التقنية المتقدمة',
    3250000.00,
    'SYP',
    0.00,
    0.00,
    'شراء 5 لابتوب ديل انسبايرون 15',
    'مشتريات أجهزة',
    'تحويل بنكي',
    'paid',
    CURRENT_DATE - INTERVAL '10 days',
    CURRENT_DATE - INTERVAL '10 days',
    CURRENT_DATE - INTERVAL '10 days',
    'تم الدفع بالتحويل البنكي',
    '550e8400-e29b-41d4-a716-446655440002'
),
(
    '550e8400-e29b-41d4-a716-446655440041',
    '550e8400-e29b-41d4-a716-446655440000',
    'INV-OUT-002',
    '550e8400-e29b-41d4-a716-446655440013',
    'مؤسسة النور للمواد المكتبية',
    200000.00,
    'SYP',
    0.00,
    0.00,
    'شراء 25 علبة ورق A4',
    'مشتريات مكتبية',
    'نقدي',
    'paid',
    CURRENT_DATE - INTERVAL '7 days',
    CURRENT_DATE - INTERVAL '7 days',
    CURRENT_DATE - INTERVAL '7 days',
    'تم الدفع نقداً',
    '550e8400-e29b-41d4-a716-446655440002'
);

-- إنشاء موظفين تجريبيين
-- Create demo employees
INSERT INTO employees (
    id,
    store_id,
    user_id,
    employee_number,
    full_name,
    email,
    phone,
    address,
    national_id,
    position,
    department,
    hire_date,
    base_salary,
    currency,
    salary_type,
    bank_account,
    emergency_contact,
    emergency_phone,
    status,
    notes,
    created_by
) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440050',
    '550e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440002',
    'EMP-001',
    'فاطمة محمد - محاسبة',
    'accountant@ibrahim-accounting.com',
    '+963994054028',
    'دمشق، سوريا',
    '12345678901',
    'محاسبة رئيسية',
    'المحاسبة',
    '2024-01-15',
    800000.00,
    'SYP',
    'monthly',
    '123456789',
    'أحمد محمد',
    '+963994054035',
    'active',
    'موظفة مميزة',
    '550e8400-e29b-41d4-a716-446655440001'
),
(
    '550e8400-e29b-41d4-a716-446655440051',
    '550e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440003',
    'EMP-002',
    'أحمد علي - مراقب مستودع',
    'warehouse@ibrahim-accounting.com',
    '+963994054029',
    'دمشق، سوريا',
    '12345678902',
    'مراقب مستودع',
    'المستودع',
    '2024-02-01',
    700000.00,
    'SYP',
    'monthly',
    '123456790',
    'علي أحمد',
    '+963994054036',
    'active',
    'خبرة في إدارة المستودعات',
    '550e8400-e29b-41d4-a716-446655440001'
),
(
    '550e8400-e29b-41d4-a716-446655440052',
    '550e8400-e29b-41d4-a716-446655440000',
    NULL,
    'EMP-003',
    'سارة خالد - مساعدة إدارية',
    'sara@ibrahim-accounting.com',
    '+963994054037',
    'دمشق، سوريا',
    '12345678903',
    'مساعدة إدارية',
    'الإدارة',
    '2024-03-01',
    500000.00,
    'SYP',
    'monthly',
    '123456791',
    'خالد سارة',
    '+963994054038',
    'active',
    'موظفة جديدة',
    '550e8400-e29b-41d4-a716-446655440001'
);

-- إنشاء تنبيهات تجريبية
-- Create demo alerts
INSERT INTO alerts (
    id,
    store_id,
    type,
    title,
    message,
    severity,
    target_user_id,
    target_role,
    is_read,
    expires_at,
    metadata
) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440060',
    '550e8400-e29b-41d4-a716-446655440000',
    'low_stock',
    'تنبيه نقص مخزون',
    'المنتج "لابتوب ديل انسبايرون 15" وصل إلى الحد الأدنى للمخزون (5 قطع)',
    'warning',
    '550e8400-e29b-41d4-a716-446655440003',
    'warehouse_manager',
    false,
    NOW() + INTERVAL '7 days',
    '{"item_id": "550e8400-e29b-41d4-a716-446655440020", "current_stock": 5, "min_stock": 2}'
),
(
    '550e8400-e29b-41d4-a716-446655440061',
    '550e8400-e29b-41d4-a716-446655440000',
    'subscription_expiring',
    'ستنتهي صلاحية الاشتراك قريباً',
    'ستنتهي صلاحية اشتراكك خلال 25 يوم. يرجى تجديد الاشتراك لتجنب انقطاع الخدمة.',
    'warning',
    '550e8400-e29b-41d4-a716-446655440001',
    'store_manager',
    false,
    NOW() + INTERVAL '30 days',
    '{"days_left": 25, "subscription_plan": "monthly"}'
),
(
    '550e8400-e29b-41d4-a716-446655440062',
    '550e8400-e29b-41d4-a716-446655440000',
    'welcome',
    'مرحباً بك في نظام إبراهيم للمحاسبة',
    'تم إنشاء متجرك "متجر إبراهيم التجريبي" بنجاح. يمكنك الآن البدء في استخدام جميع ميزات النظام خلال فترة التجربة المجانية 30 يوم.',
    'info',
    '550e8400-e29b-41d4-a716-446655440001',
    'store_manager',
    true,
    NOW() + INTERVAL '30 days',
    '{"store_name": "متجر إبراهيم التجريبي", "trial_days": 30}'
);

-- إنشاء إعدادات تجريبية
-- Create demo settings
INSERT INTO settings (
    id,
    store_id,
    setting_key,
    setting_value,
    description,
    setting_type,
    updated_by
) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440070',
    '550e8400-e29b-41d4-a716-446655440000',
    'default_language',
    '"ar"',
    'اللغة الافتراضية للنظام',
    'general',
    '550e8400-e29b-41d4-a716-446655440001'
),
(
    '550e8400-e29b-41d4-a716-446655440071',
    '550e8400-e29b-41d4-a716-446655440000',
    'default_currency',
    '"SYP"',
    'العملة الافتراضية للمتجر',
    'financial',
    '550e8400-e29b-41d4-a716-446655440001'
),
(
    '550e8400-e29b-41d4-a716-446655440072',
    '550e8400-e29b-41d4-a716-446655440000',
    'tax_rate',
    '0.0',
    'معدل الضريبة الافتراضي',
    'financial',
    '550e8400-e29b-41d4-a716-446655440001'
),
(
    '550e8400-e29b-41d4-a716-446655440073',
    '550e8400-e29b-41d4-a716-446655440000',
    'invoice_prefix',
    '{"in": "INV-IN-", "out": "INV-OUT-"}',
    'بادئات أرقام الفواتير',
    'invoicing',
    '550e8400-e29b-41d4-a716-446655440001'
),
(
    '550e8400-e29b-41d4-a716-446655440074',
    '550e8400-e29b-41d4-a716-446655440000',
    'low_stock_threshold',
    '5',
    'الحد الأدنى للتنبيه من نقص المخزون',
    'inventory',
    '550e8400-e29b-41d4-a716-446655440001'
);
