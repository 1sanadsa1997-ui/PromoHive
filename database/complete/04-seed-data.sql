-- نظام إبراهيم للمحاسبة - البيانات الأساسية والتجريبية
-- Ibrahim Accounting System - Seed Data

-- إدراج العملات الأساسية
INSERT INTO currencies (code, name, symbol) VALUES
('TRY', 'الليرة التركية', '₺'),
('SYP', 'الليرة السورية', 'ل.س'),
('USD', 'الدولار الأمريكي', '$'),
('EUR', 'اليورو', '€')
ON CONFLICT (code) DO NOTHING;

-- إنشاء مستخدم إداري رئيسي (system admin)
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
    '$2b$10$rQZ8kHp.TB.It.NE.Lgs4OLjVKVK8rQZ8kHp.TB.It.NE.Lgs4OLjVK', -- كلمة المرور: SystemAdmin123!
    'system_admin',
    'إدارة النظام',
    'annual',
    '2030-12-31 23:59:59+00',
    true,
    'ar'
) ON CONFLICT (email) DO NOTHING;

-- إنشاء مدير متجر تجريبي (إبراهيم)
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
    '$2b$10$rQZ8kHp.TB.It.NE.Lgs4OLjVKVK8rQZ8kHp.TB.It.NE.Lgs4OLjVK', -- كلمة المرور: Ibrahim123!
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
    '$2b$10$rQZ8kHp.TB.It.NE.Lgs4OLjVKVK8rQZ8kHp.TB.It.NE.Lgs4OLjVK', -- كلمة المرور: Ahmed123!
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
    '$2b$10$rQZ8kHp.TB.It.NE.Lgs4OLjVKVK8rQZ8kHp.TB.It.NE.Lgs4OLjVK', -- كلمة المرور: Mohammed123!
    'warehouse_manager',
    'متجر إبراهيم التجاري',
    '11111111-1111-1111-1111-111111111111',
    'trial',
    NOW() + INTERVAL '30 days',
    true,
    'ar'
) ON CONFLICT (email) DO NOTHING;

-- إضافة شركاء تجريبيين (عملاء وموردين)
INSERT INTO partners (
    id,
    store_owner_id,
    type,
    name,
    phone,
    email,
    address,
    notes,
    created_by
) VALUES 
(
    '44444444-4444-4444-4444-444444444444',
    '11111111-1111-1111-1111-111111111111',
    'customer',
    'شركة الأمل التجارية',
    '+90 555 123 4567',
    'amal@company.com',
    'إسطنبول، تركيا',
    'عميل مهم - دفع نقدي',
    '11111111-1111-1111-1111-111111111111'
),
(
    '55555555-5555-5555-5555-555555555555',
    '11111111-1111-1111-1111-111111111111',
    'vendor',
    'مورد المواد الغذائية',
    '+963 11 123 4567',
    'food@supplier.com',
    'دمشق، سوريا',
    'مورد موثوق - شروط دفع 30 يوم',
    '11111111-1111-1111-1111-111111111111'
),
(
    '66666666-6666-6666-6666-666666666666',
    '11111111-1111-1111-1111-111111111111',
    'customer',
    'متجر الورود',
    '+90 555 987 6543',
    'roses@shop.com',
    'أنقرة، تركيا',
    'عميل منتظم - خصم 5%',
    '11111111-1111-1111-1111-111111111111'
) ON CONFLICT (id) DO NOTHING;

-- إضافة منتجات تجريبية للمخزون
INSERT INTO inventory_items (
    id,
    store_owner_id,
    sku,
    name,
    description,
    unit,
    min_stock,
    current_stock,
    price,
    currency,
    category,
    created_by
) VALUES 
(
    '77777777-7777-7777-7777-777777777777',
    '11111111-1111-1111-1111-111111111111',
    'FOOD-001',
    'أرز بسمتي',
    'أرز بسمتي درجة أولى - كيس 5 كيلو',
    'كيس',
    10,
    50,
    25.00,
    'TRY',
    'مواد غذائية',
    '11111111-1111-1111-1111-111111111111'
),
(
    '88888888-8888-8888-8888-888888888888',
    '11111111-1111-1111-1111-111111111111',
    'CLEAN-001',
    'مسحوق غسيل',
    'مسحوق غسيل للملابس - عبوة 3 كيلو',
    'عبوة',
    5,
    25,
    15.50,
    'TRY',
    'مواد تنظيف',
    '11111111-1111-1111-1111-111111111111'
),
(
    '99999999-9999-9999-9999-999999999999',
    '11111111-1111-1111-1111-111111111111',
    'DRINK-001',
    'عصير برتقال',
    'عصير برتقال طبيعي - عبوة 1 لتر',
    'عبوة',
    20,
    100,
    8.75,
    'TRY',
    'مشروبات',
    '11111111-1111-1111-1111-111111111111'
) ON CONFLICT (id) DO NOTHING;

-- إضافة موظفين تجريبيين
INSERT INTO employees (
    id,
    store_owner_id,
    user_id,
    employee_number,
    name,
    position,
    department,
    base_salary,
    currency,
    hire_date,
    phone,
    email,
    created_by
) VALUES 
(
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    'EMP-001',
    'أحمد المحاسب',
    'محاسب رئيسي',
    'المحاسبة',
    3500.00,
    'TRY',
    '2024-01-15',
    '+90 555 111 2233',
    'accountant@store.com',
    '11111111-1111-1111-1111-111111111111'
),
(
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '11111111-1111-1111-1111-111111111111',
    '33333333-3333-3333-3333-333333333333',
    'EMP-002',
    'محمد مدير المستودع',
    'مدير مستودع',
    'المستودع',
    3000.00,
    'TRY',
    '2024-02-01',
    '+90 555 444 5566',
    'warehouse@store.com',
    '11111111-1111-1111-1111-111111111111'
),
(
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    '11111111-1111-1111-1111-111111111111',
    NULL,
    'EMP-003',
    'فاطمة البائعة',
    'بائعة',
    'المبيعات',
    2500.00,
    'TRY',
    '2024-03-01',
    '+90 555 777 8899',
    'fatima@store.com',
    '11111111-1111-1111-1111-111111111111'
) ON CONFLICT (id) DO NOTHING;

-- إضافة فواتير تجريبية
INSERT INTO invoices_out (
    id,
    store_owner_id,
    invoice_number,
    customer_id,
    amount,
    currency,
    description,
    category,
    date,
    due_date,
    status,
    created_by
) VALUES 
(
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    '11111111-1111-1111-1111-111111111111',
    'OUT-2024-001',
    '44444444-4444-4444-4444-444444444444',
    1250.00,
    'TRY',
    'بيع مواد غذائية متنوعة',
    'مبيعات',
    CURRENT_DATE - INTERVAL '5 days',
    CURRENT_DATE + INTERVAL '25 days',
    'paid',
    '11111111-1111-1111-1111-111111111111'
),
(
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    '11111111-1111-1111-1111-111111111111',
    'OUT-2024-002',
    '66666666-6666-6666-6666-666666666666',
    875.50,
    'TRY',
    'بيع مواد تنظيف ومشروبات',
    'مبيعات',
    CURRENT_DATE - INTERVAL '2 days',
    CURRENT_DATE + INTERVAL '28 days',
    'pending',
    '22222222-2222-2222-2222-222222222222'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO invoices_in (
    id,
    store_owner_id,
    invoice_number,
    vendor_id,
    amount,
    currency,
    description,
    category,
    date,
    due_date,
    status,
    created_by
) VALUES 
(
    'ffffffff-ffff-ffff-ffff-ffffffffffff',
    '11111111-1111-1111-1111-111111111111',
    'IN-2024-001',
    '55555555-5555-5555-5555-555555555555',
    2500.00,
    'TRY',
    'شراء مواد غذائية للمخزون',
    'مشتريات',
    CURRENT_DATE - INTERVAL '10 days',
    CURRENT_DATE + INTERVAL '20 days',
    'paid',
    '11111111-1111-1111-1111-111111111111'
) ON CONFLICT (id) DO NOTHING;

-- إضافة حركات مخزون تجريبية
INSERT INTO inventory_movements (
    id,
    store_owner_id,
    item_id,
    type,
    quantity,
    unit_price,
    total_value,
    currency,
    date,
    notes,
    created_by
) VALUES 
(
    '10101010-1010-1010-1010-101010101010',
    '11111111-1111-1111-1111-111111111111',
    '77777777-7777-7777-7777-777777777777',
    'in',
    100,
    20.00,
    2000.00,
    'TRY',
    CURRENT_DATE - INTERVAL '10 days',
    'شراء مخزون أولي',
    '11111111-1111-1111-1111-111111111111'
),
(
    '20202020-2020-2020-2020-202020202020',
    '11111111-1111-1111-1111-111111111111',
    '77777777-7777-7777-7777-777777777777',
    'out',
    50,
    25.00,
    1250.00,
    'TRY',
    CURRENT_DATE - INTERVAL '5 days',
    'بيع للعميل - فاتورة OUT-2024-001',
    '22222222-2222-2222-2222-222222222222'
) ON CONFLICT (id) DO NOTHING;

-- إضافة تنبيهات تجريبية
INSERT INTO alerts (
    id,
    store_owner_id,
    user_id,
    type,
    title,
    message,
    priority,
    is_read
) VALUES 
(
    '30303030-3030-3030-3030-303030303030',
    '11111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    'subscription_expiry',
    'انتهاء فترة التجربة قريباً',
    'ستنتهي فترة التجربة المجانية خلال 25 يوماً. قم بترقية حسابك للاستمرار.',
    'high',
    false
),
(
    '40404040-4040-4040-4040-404040404040',
    '11111111-1111-1111-1111-111111111111',
    '33333333-3333-3333-3333-333333333333',
    'low_stock',
    'نقص في المخزون',
    'مسحوق الغسيل (CLEAN-001) أصبح أقل من الحد الأدنى المطلوب.',
    'medium',
    false
) ON CONFLICT (id) DO NOTHING;

-- إضافة إعدادات افتراضية
INSERT INTO settings (
    store_owner_id,
    key,
    value,
    description
) VALUES 
(
    '11111111-1111-1111-1111-111111111111',
    'default_currency',
    '"TRY"',
    'العملة الافتراضية للمتجر'
),
(
    '11111111-1111-1111-1111-111111111111',
    'low_stock_threshold',
    '10',
    'الحد الأدنى للتنبيه من نقص المخزون'
),
(
    '11111111-1111-1111-1111-111111111111',
    'invoice_auto_number',
    'true',
    'ترقيم الفواتير تلقائياً'
),
(
    '11111111-1111-1111-1111-111111111111',
    'backup_frequency',
    '"daily"',
    'تكرار النسخ الاحتياطي'
) ON CONFLICT (store_owner_id, key) DO NOTHING;

