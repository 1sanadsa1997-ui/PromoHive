-- نظام إبراهيم للمحاسبة - سياسات الأمان على مستوى الصفوف
-- Ibrahim Accounting System - Row Level Security Policies

-- تفعيل RLS على جميع الجداول
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices_in ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices_out ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- سياسات جدول المستخدمين
-- المدير العام يمكنه رؤية جميع المستخدمين
CREATE POLICY "system_admin_can_view_all_users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid() AND u.role = 'system_admin'
        )
    );

-- مدير المتجر يمكنه رؤية موظفيه فقط
CREATE POLICY "store_owner_can_view_employees" ON users
    FOR SELECT USING (
        store_owner_id = auth.uid() OR id = auth.uid()
    );

-- المستخدم يمكنه رؤية بياناته الشخصية
CREATE POLICY "users_can_view_own_profile" ON users
    FOR SELECT USING (id = auth.uid());

-- تحديث البيانات الشخصية
CREATE POLICY "users_can_update_own_profile" ON users
    FOR UPDATE USING (id = auth.uid());

-- سياسات جدول سجل النشاطات
CREATE POLICY "users_can_view_own_audit_logs" ON audit_logs
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid() AND u.role IN ('system_admin', 'store_owner')
        )
    );

CREATE POLICY "system_can_insert_audit_logs" ON audit_logs
    FOR INSERT WITH CHECK (true);

-- سياسات جدول الشركاء
CREATE POLICY "store_data_isolation_partners" ON partners
    FOR ALL USING (
        store_owner_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid() AND u.store_owner_id = partners.store_owner_id
        )
    );

-- سياسات جدول الفواتير الواردة
CREATE POLICY "store_data_isolation_invoices_in" ON invoices_in
    FOR ALL USING (
        store_owner_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid() AND u.store_owner_id = invoices_in.store_owner_id
        )
    );

-- سياسات جدول الفواتير الصادرة
CREATE POLICY "store_data_isolation_invoices_out" ON invoices_out
    FOR ALL USING (
        store_owner_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid() AND u.store_owner_id = invoices_out.store_owner_id
        )
    );

-- سياسات جدول المنتجات والمخزون
CREATE POLICY "store_data_isolation_inventory_items" ON inventory_items
    FOR ALL USING (
        store_owner_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid() AND u.store_owner_id = inventory_items.store_owner_id
        )
    );

-- سياسات جدول حركات المخزون
CREATE POLICY "store_data_isolation_inventory_movements" ON inventory_movements
    FOR ALL USING (
        store_owner_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid() AND u.store_owner_id = inventory_movements.store_owner_id
        )
    );

-- سياسات جدول الموظفين
CREATE POLICY "store_data_isolation_employees" ON employees
    FOR ALL USING (
        store_owner_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid() AND u.store_owner_id = employees.store_owner_id
        )
    );

-- سياسات جدول معاملات الموظفين
CREATE POLICY "store_data_isolation_employee_transactions" ON employee_transactions
    FOR ALL USING (
        store_owner_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid() AND u.store_owner_id = employee_transactions.store_owner_id
        )
    );

-- سياسات جدول كشوف الرواتب
CREATE POLICY "store_data_isolation_payroll" ON payroll
    FOR ALL USING (
        store_owner_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid() AND u.store_owner_id = payroll.store_owner_id
        )
    );

-- الموظف يمكنه رؤية كشف راتبه فقط
CREATE POLICY "employees_can_view_own_payroll" ON payroll
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM employees e 
            WHERE e.id = payroll.employee_id AND e.user_id = auth.uid()
        )
    );

-- سياسات جدول التنبيهات
CREATE POLICY "store_data_isolation_alerts" ON alerts
    FOR ALL USING (
        store_owner_id = auth.uid() OR
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid() AND u.store_owner_id = alerts.store_owner_id
        )
    );

-- سياسات جدول الإعدادات
CREATE POLICY "store_data_isolation_settings" ON settings
    FOR ALL USING (
        store_owner_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid() AND u.store_owner_id = settings.store_owner_id
        )
    );

-- سياسات خاصة للقراءة العامة
-- العملات متاحة للجميع
ALTER TABLE currencies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "currencies_are_public" ON currencies FOR SELECT USING (true);

-- إنشاء دوال مساعدة للتحقق من الصلاحيات
CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS TEXT AS $$
    SELECT role FROM users WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;

CREATE OR REPLACE FUNCTION auth.user_store_owner_id()
RETURNS UUID AS $$
    SELECT COALESCE(store_owner_id, id) FROM users WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;

CREATE OR REPLACE FUNCTION auth.is_store_owner()
RETURNS BOOLEAN AS $$
    SELECT role = 'store_owner' FROM users WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;

CREATE OR REPLACE FUNCTION auth.is_system_admin()
RETURNS BOOLEAN AS $$
    SELECT role = 'system_admin' FROM users WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;

