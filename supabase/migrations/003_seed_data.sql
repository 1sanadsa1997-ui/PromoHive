-- نظام إبراهيم للمحاسبة - البيانات الأولية
-- Ibrahim Accounting System - Seed Data

-- إنشاء متجر تجريبي للاختبار
INSERT INTO stores (
    id,
    name,
    description,
    owner_email,
    phone,
    address,
    default_currency,
    subscription_status,
    subscription_start_date,
    subscription_end_date,
    subscription_plan
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'متجر إبراهيم التجريبي',
    'متجر تجريبي لاختبار نظام إبراهيم للمحاسبة',
    'systemibrahem@gmail.com',
    '+963 994 054 027',
    'دمشق، سوريا',
    'SYP',
    'trial',
    NOW(),
    NOW() + INTERVAL '30 days',
    'monthly'
) ON CONFLICT (id) DO NOTHING;

-- إنشاء مستخدم مالك النظام
INSERT INTO users (
    id,
    store_id,
    email,
    username,
    password_hash,
    full_name,
    role,
    permissions,
    phone,
    is_active,
    locale,
    theme
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'systemibrahem@gmail.com',
    'ibrahim_admin',
    '$2b$12$LQv3c1yqBWVHxkd0LQ4YCOdHrADfEqJpb2/ZGVstL5qRMqSvxzZm2', -- password: ibrahim123
    'إبراهيم - مالك النظام',
    'system_owner',
    '{"all": true}',
    '+963 994 054 027',
    true,
    'ar',
    'light'
) ON CONFLICT (id) DO NOTHING;

-- إنشاء مستخدم مدير متجر تجريبي
INSERT INTO users (
    id,
    store_id,
    email,
    username,
    password_hash,
    full_name,
    role,
    permissions,
    phone,
    is_active,
    locale,
    theme,
    created_by
) VALUES (
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'manager@demo.com',
    'store_manager',
    '$2b$12$LQv3c1yqBWVHxkd0LQ4YCOdHrADfEqJpb2/ZGVstL5qRMqSvxzZm2', -- password: ibrahim123
    'أحمد محمد - مدير المتجر',
    'store_manager',
    '{"invoices": {"read": true, "write": true, "delete": false}, "inventory": {"read": true, "write": true, "delete": false}, "employees": {"read": true, "write": true, "delete": false}, "reports": {"read": true, "write": false, "delete": false}}',
    '+963 11 1234567',
    true,
    'ar',
    'light',
    '00000000-0000-0000-0000-000000000001'
) ON CONFLICT (id) DO NOTHING;

-- إنشاء مستخدم محاسب تجريبي
INSERT INTO users (
    id,
    store_id,
    email,
    username,
    password_hash,
    full_name,
    role,
    permissions,
    phone,
    is_active,
    locale,
    theme,
    created_by
) VALUES (
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    'accountant@demo.com',
    'accountant',
    '$2b$12$LQv3c1yqBWVHxkd0LQ4YCOdHrADfEqJpb2/ZGVstL5qRMqSvxzZm2', -- password: ibrahim123
    'فاطمة علي - محاسبة',
    'accountant',
    '{"invoices": {"read": true, "write": true, "delete": false}, "reports": {"read": true, "write": false, "delete": false}, "payroll": {"read": true, "write": true, "delete": false}}',
    '+963 11 2345678',
    true,
    'ar',
    'light',
    '00000000-0000-0000-0000-000000000002'
) ON CONFLICT (id) DO NOTHING;

-- إنشاء شركاء تجريبيين (عملاء وموردين)
INSERT INTO partners (
    id,
    store_id,
    type,
    name,
    email,
    phone,
    address,
    tax_number,
    notes,
    created_by
) VALUES 
(
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'customer',
    'شركة الأمل للتجارة',
    'amal@company.com',
    '+963 11 3456789',
    'حلب، سوريا',
    '123456789',
    'عميل مهم - دفع شهري',
    '00000000-0000-0000-0000-000000000002'
),
(
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'vendor',
    'مؤسسة النور للمواد',
    'nour@supplier.com',
    '+963 21 4567890',
    'دمشق، سوريا',
    '987654321',
    'مورد أساسي - شروط دفع 30 يوم',
    '00000000-0000-0000-0000-000000000002'
),
(
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    'both',
    'شركة الفجر المتحدة',
    'fajr@united.com',
    '+963 31 5678901',
    'حمص، سوريا',
    '456789123',
    'شريك تجاري - عميل ومورد',
    '00000000-0000-0000-0000-000000000002'
) ON CONFLICT (id) DO NOTHING;

-- إنشاء منتجات تجريبية
INSERT INTO inventory_items (
    id,
    store_id,
    sku,
    name,
    description,
    unit,
    current_stock,
    min_stock,
    price,
    currency,
    category,
    location,
    created_by
) VALUES 
(
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'PROD-001',
    'لابتوب ديل XPS 13',
    'لابتوب ديل XPS 13 - معالج Intel i7 - ذاكرة 16GB - SSD 512GB',
    'قطعة',
    25,
    5,
    850000,
    'SYP',
    'أجهزة كمبيوتر',
    'المستودع الرئيسي - الرف A1',
    '00000000-0000-0000-0000-000000000002'
),
(
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'PROD-002',
    'ماوس لوجيتك MX Master 3',
    'ماوس لاسلكي متقدم للمحترفين',
    'قطعة',
    50,
    10,
    45000,
    'SYP',
    'ملحقات كمبيوتر',
    'المستودع الرئيسي - الرف B2',
    '00000000-0000-0000-0000-000000000002'
),
(
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    'PROD-003',
    'كيبورد ميكانيكي',
    'لوحة مفاتيح ميكانيكية RGB للألعاب',
    'قطعة',
    30,
    8,
    75000,
    'SYP',
    'ملحقات كمبيوتر',
    'المستودع الرئيسي - الرف B1',
    '00000000-0000-0000-0000-000000000002'
) ON CONFLICT (id) DO NOTHING;

-- إنشاء موظفين تجريبيين
INSERT INTO employees (
    id,
    store_id,
    employee_number,
    full_name,
    email,
    phone,
    position,
    department,
    base_salary,
    currency,
    hire_date,
    status,
    bank_account,
    national_id,
    address,
    emergency_contact,
    created_by
) VALUES 
(
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'EMP-001',
    'محمد أحمد السوري',
    'mohammed@demo.com',
    '+963 11 6789012',
    'مطور برمجيات',
    'تقنية المعلومات',
    500000,
    'SYP',
    '2024-01-15',
    'active',
    '1234567890123456',
    '01234567890',
    'دمشق - المزة',
    '{"name": "أحمد السوري", "phone": "+963 11 7890123", "relation": "والد"}',
    '00000000-0000-0000-0000-000000000002'
),
(
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'EMP-002',
    'سارة محمد الحلبي',
    'sara@demo.com',
    '+963 21 7890123',
    'مصممة جرافيك',
    'التسويق',
    400000,
    'SYP',
    '2024-02-01',
    'active',
    '2345678901234567',
    '09876543210',
    'حلب - الفرقان',
    '{"name": "محمد الحلبي", "phone": "+963 21 8901234", "relation": "زوج"}',
    '00000000-0000-0000-0000-000000000002'
) ON CONFLICT (id) DO NOTHING;

-- إنشاء فواتير واردات تجريبية
INSERT INTO invoices_in (
    id,
    store_id,
    invoice_number,
    amount,
    currency,
    description,
    date,
    vendor_id,
    category,
    status,
    created_by
) VALUES 
(
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'IN-2024-001',
    2550000,
    'SYP',
    'شراء 3 أجهزة لابتوب ديل XPS 13',
    '2024-11-01',
    '00000000-0000-0000-0000-000000000002',
    'أجهزة كمبيوتر',
    'approved',
    '00000000-0000-0000-0000-000000000003'
),
(
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'IN-2024-002',
    450000,
    'SYP',
    'شراء 10 ماوس لوجيتك و 6 كيبورد ميكانيكي',
    '2024-11-02',
    '00000000-0000-0000-0000-000000000002',
    'ملحقات كمبيوتر',
    'approved',
    '00000000-0000-0000-0000-000000000003'
) ON CONFLICT (id) DO NOTHING;

-- إنشاء فواتير صادرات تجريبية
INSERT INTO invoices_out (
    id,
    store_id,
    invoice_number,
    amount,
    currency,
    description,
    date,
    customer_id,
    category,
    status,
    created_by
) VALUES 
(
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'OUT-2024-001',
    850000,
    'SYP',
    'بيع لابتوب ديل XPS 13',
    '2024-11-01',
    '00000000-0000-0000-0000-000000000001',
    'أجهزة كمبيوتر',
    'approved',
    '00000000-0000-0000-0000-000000000003'
),
(
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'OUT-2024-002',
    120000,
    'SYP',
    'بيع 2 ماوس لوجيتك و 1 كيبورد ميكانيكي',
    '2024-11-02',
    '00000000-0000-0000-0000-000000000003',
    'ملحقات كمبيوتر',
    'approved',
    '00000000-0000-0000-0000-000000000003'
) ON CONFLICT (id) DO NOTHING;

-- إنشاء حركات مخزون تجريبية
INSERT INTO inventory_movements (
    id,
    store_id,
    item_id,
    type,
    quantity,
    unit_price,
    total_value,
    currency,
    reference_type,
    reference_id,
    notes,
    date,
    created_by
) VALUES 
(
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'in',
    3,
    850000,
    2550000,
    'SYP',
    'invoice_in',
    '00000000-0000-0000-0000-000000000001',
    'استلام أجهزة لابتوب من المورد',
    '2024-11-01',
    '00000000-0000-0000-0000-000000000003'
),
(
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'out',
    1,
    850000,
    850000,
    'SYP',
    'invoice_out',
    '00000000-0000-0000-0000-000000000001',
    'بيع لابتوب للعميل',
    '2024-11-01',
    '00000000-0000-0000-0000-000000000003'
) ON CONFLICT (id) DO NOTHING;

-- إنشاء معاملات موظفين تجريبية
INSERT INTO employee_transactions (
    id,
    store_id,
    employee_id,
    type,
    amount,
    currency,
    description,
    date,
    status,
    created_by
) VALUES 
(
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'advance',
    100000,
    'SYP',
    'سلفة شهر نوفمبر',
    '2024-11-01',
    'approved',
    '00000000-0000-0000-0000-000000000002'
),
(
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    'bonus',
    50000,
    'SYP',
    'مكافأة إنجاز مشروع التصميم',
    '2024-11-01',
    'approved',
    '00000000-0000-0000-0000-000000000002'
) ON CONFLICT (id) DO NOTHING;

-- إنشاء إعدادات النظام الأساسية
INSERT INTO settings (
    store_id,
    category,
    key,
    value,
    description,
    is_system
) VALUES 
(
    '00000000-0000-0000-0000-000000000001',
    'general',
    'company_name',
    '"متجر إبراهيم التجريبي"',
    'اسم الشركة',
    false
),
(
    '00000000-0000-0000-0000-000000000001',
    'general',
    'default_currency',
    '"SYP"',
    'العملة الافتراضية',
    false
),
(
    '00000000-0000-0000-0000-000000000001',
    'notifications',
    'low_stock_enabled',
    'true',
    'تفعيل تنبيهات نقص المخزون',
    false
),
(
    '00000000-0000-0000-0000-000000000001',
    'notifications',
    'email_notifications',
    'true',
    'تفعيل الإشعارات عبر البريد الإلكتروني',
    false
),
(
    '00000000-0000-0000-0000-000000000001',
    'reports',
    'auto_backup',
    'true',
    'تفعيل النسخ الاحتياطي التلقائي',
    false
),
(
    '00000000-0000-0000-0000-000000000001',
    'whatsapp',
    'support_number',
    '"+963994054027"',
    'رقم الواتساب للدعم',
    true
),
(
    '00000000-0000-0000-0000-000000000001',
    'whatsapp',
    'support_message',
    '"مرحباً، أريد الاستفسار عن نظام إبراهيم للمحاسبة"',
    'رسالة الواتساب الافتراضية',
    true
) ON CONFLICT (store_id, category, key) DO NOTHING;

-- إنشاء تنبيهات تجريبية
INSERT INTO alerts (
    store_id,
    type,
    title,
    message,
    severity,
    entity_type,
    entity_id,
    target_role
) VALUES 
(
    '00000000-0000-0000-0000-000000000001',
    'subscription_expiry',
    'انتهاء التجربة المجانية قريباً',
    'ستنتهي فترة التجربة المجانية خلال 7 أيام. يرجى تجديد الاشتراك لمتابعة استخدام النظام.',
    'warning',
    'stores',
    '00000000-0000-0000-0000-000000000001',
    'store_manager'
),
(
    '00000000-0000-0000-0000-000000000001',
    'welcome',
    'مرحباً بك في نظام إبراهيم للمحاسبة',
    'تم إنشاء حسابك بنجاح. يمكنك الآن البدء في استخدام جميع ميزات النظام.',
    'info',
    'users',
    '00000000-0000-0000-0000-000000000002',
    'store_manager'
) ON CONFLICT DO NOTHING;
