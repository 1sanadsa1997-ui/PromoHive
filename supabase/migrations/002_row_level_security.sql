-- نظام إبراهيم للمحاسبة - Row Level Security وسياسات الأمان
-- Ibrahim Accounting System - Row Level Security and Security Policies

-- تفعيل RLS على جميع الجداول
-- Enable RLS on all tables
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
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

-- دوال مساعدة للتحقق من الصلاحيات
-- Helper functions for permission checks

-- دالة للحصول على معرف المستخدم الحالي
CREATE OR REPLACE FUNCTION auth.current_user_id()
RETURNS UUID AS $$
BEGIN
  RETURN (auth.jwt() ->> 'sub')::UUID;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- دالة للحصول على معرف المتجر للمستخدم الحالي
CREATE OR REPLACE FUNCTION auth.current_user_store_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT store_id 
    FROM users 
    WHERE id = auth.current_user_id()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- دالة للتحقق من دور المستخدم
CREATE OR REPLACE FUNCTION auth.current_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT role 
    FROM users 
    WHERE id = auth.current_user_id()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- دالة للتحقق من صحة الاشتراك
CREATE OR REPLACE FUNCTION auth.is_subscription_active(store_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT 
      (subscription_status IN ('trial', 'active')) 
      AND (subscription_end_date > NOW())
    FROM stores 
    WHERE id = store_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- دالة للتحقق من صلاحية المستخدم
CREATE OR REPLACE FUNCTION auth.has_permission(permission_key TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_permissions JSONB;
  user_role TEXT;
BEGIN
  SELECT role, permissions INTO user_role, user_permissions
  FROM users 
  WHERE id = auth.current_user_id();
  
  -- مالك النظام له صلاحية كاملة
  IF user_role = 'system_owner' THEN
    RETURN TRUE;
  END IF;
  
  -- مدير المتجر له صلاحية كاملة في متجره
  IF user_role = 'store_manager' THEN
    RETURN TRUE;
  END IF;
  
  -- التحقق من الصلاحيات المحددة
  RETURN COALESCE((user_permissions ->> permission_key)::BOOLEAN, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- سياسات جدول المتاجر
-- Stores table policies

-- مالك النظام يمكنه رؤية جميع المتاجر
CREATE POLICY "system_owner_can_view_all_stores" ON stores
  FOR SELECT USING (
    auth.current_user_role() = 'system_owner'
  );

-- مدير المتجر يمكنه رؤية متجره فقط
CREATE POLICY "store_manager_can_view_own_store" ON stores
  FOR SELECT USING (
    id = auth.current_user_store_id()
  );

-- مالك النظام يمكنه تحديث جميع المتاجر
CREATE POLICY "system_owner_can_update_all_stores" ON stores
  FOR UPDATE USING (
    auth.current_user_role() = 'system_owner'
  );

-- مدير المتجر يمكنه تحديث متجره فقط
CREATE POLICY "store_manager_can_update_own_store" ON stores
  FOR UPDATE USING (
    id = auth.current_user_store_id() AND
    auth.current_user_role() = 'store_manager'
  );

-- سياسات جدول المستخدمين
-- Users table policies

-- المستخدمون يمكنهم رؤية مستخدمي متجرهم فقط
CREATE POLICY "users_can_view_store_users" ON users
  FOR SELECT USING (
    store_id = auth.current_user_store_id() OR
    auth.current_user_role() = 'system_owner'
  );

-- مدير المتجر يمكنه إنشاء مستخدمين في متجره
CREATE POLICY "store_manager_can_create_users" ON users
  FOR INSERT WITH CHECK (
    store_id = auth.current_user_store_id() AND
    auth.current_user_role() IN ('system_owner', 'store_manager')
  );

-- مدير المتجر يمكنه تحديث مستخدمي متجره
CREATE POLICY "store_manager_can_update_store_users" ON users
  FOR UPDATE USING (
    store_id = auth.current_user_store_id() AND
    auth.current_user_role() IN ('system_owner', 'store_manager')
  );

-- المستخدم يمكنه تحديث ملفه الشخصي
CREATE POLICY "users_can_update_own_profile" ON users
  FOR UPDATE USING (
    id = auth.current_user_id()
  );

-- سياسات جدول سجل العمليات
-- Audit logs table policies

-- المستخدمون يمكنهم رؤية سجل عمليات متجرهم فقط
CREATE POLICY "users_can_view_store_audit_logs" ON audit_logs
  FOR SELECT USING (
    store_id = auth.current_user_store_id() OR
    auth.current_user_role() = 'system_owner'
  );

-- إدراج سجل العمليات تلقائياً
CREATE POLICY "system_can_insert_audit_logs" ON audit_logs
  FOR INSERT WITH CHECK (TRUE);

-- سياسات جدول الشركاء
-- Partners table policies

-- المستخدمون يمكنهم رؤية شركاء متجرهم فقط
CREATE POLICY "users_can_view_store_partners" ON partners
  FOR SELECT USING (
    store_id = auth.current_user_store_id() AND
    auth.is_subscription_active(store_id)
  );

-- المستخدمون المخولون يمكنهم إنشاء شركاء
CREATE POLICY "authorized_users_can_create_partners" ON partners
  FOR INSERT WITH CHECK (
    store_id = auth.current_user_store_id() AND
    auth.is_subscription_active(store_id) AND
    auth.has_permission('partners.create')
  );

-- المستخدمون المخولون يمكنهم تحديث الشركاء
CREATE POLICY "authorized_users_can_update_partners" ON partners
  FOR UPDATE USING (
    store_id = auth.current_user_store_id() AND
    auth.is_subscription_active(store_id) AND
    auth.has_permission('partners.update')
  );

-- سياسات جدول الفواتير الواردة
-- Incoming invoices table policies

-- المستخدمون يمكنهم رؤية فواتير متجرهم فقط
CREATE POLICY "users_can_view_store_invoices_in" ON invoices_in
  FOR SELECT USING (
    store_id = auth.current_user_store_id() AND
    auth.is_subscription_active(store_id)
  );

-- المستخدمون المخولون يمكنهم إنشاء فواتير
CREATE POLICY "authorized_users_can_create_invoices_in" ON invoices_in
  FOR INSERT WITH CHECK (
    store_id = auth.current_user_store_id() AND
    auth.is_subscription_active(store_id) AND
    auth.has_permission('invoices.create')
  );

-- المستخدمون المخولون يمكنهم تحديث الفواتير
CREATE POLICY "authorized_users_can_update_invoices_in" ON invoices_in
  FOR UPDATE USING (
    store_id = auth.current_user_store_id() AND
    auth.is_subscription_active(store_id) AND
    auth.has_permission('invoices.update')
  );

-- سياسات جدول الفواتير الصادرة
-- Outgoing invoices table policies

-- المستخدمون يمكنهم رؤية فواتير متجرهم فقط
CREATE POLICY "users_can_view_store_invoices_out" ON invoices_out
  FOR SELECT USING (
    store_id = auth.current_user_store_id() AND
    auth.is_subscription_active(store_id)
  );

-- المستخدمون المخولون يمكنهم إنشاء فواتير
CREATE POLICY "authorized_users_can_create_invoices_out" ON invoices_out
  FOR INSERT WITH CHECK (
    store_id = auth.current_user_store_id() AND
    auth.is_subscription_active(store_id) AND
    auth.has_permission('invoices.create')
  );

-- المستخدمون المخولون يمكنهم تحديث الفواتير
CREATE POLICY "authorized_users_can_update_invoices_out" ON invoices_out
  FOR UPDATE USING (
    store_id = auth.current_user_store_id() AND
    auth.is_subscription_active(store_id) AND
    auth.has_permission('invoices.update')
  );

-- سياسات جدول عناصر المستودع
-- Inventory items table policies

-- المستخدمون يمكنهم رؤية عناصر مستودع متجرهم فقط
CREATE POLICY "users_can_view_store_inventory_items" ON inventory_items
  FOR SELECT USING (
    store_id = auth.current_user_store_id() AND
    auth.is_subscription_active(store_id)
  );

-- المستخدمون المخولون يمكنهم إنشاء عناصر المستودع
CREATE POLICY "authorized_users_can_create_inventory_items" ON inventory_items
  FOR INSERT WITH CHECK (
    store_id = auth.current_user_store_id() AND
    auth.is_subscription_active(store_id) AND
    auth.has_permission('inventory.create')
  );

-- المستخدمون المخولون يمكنهم تحديث عناصر المستودع
CREATE POLICY "authorized_users_can_update_inventory_items" ON inventory_items
  FOR UPDATE USING (
    store_id = auth.current_user_store_id() AND
    auth.is_subscription_active(store_id) AND
    auth.has_permission('inventory.update')
  );

-- سياسات جدول حركات المستودع
-- Inventory movements table policies

-- المستخدمون يمكنهم رؤية حركات مستودع متجرهم فقط
CREATE POLICY "users_can_view_store_inventory_movements" ON inventory_movements
  FOR SELECT USING (
    store_id = auth.current_user_store_id() AND
    auth.is_subscription_active(store_id)
  );

-- المستخدمون المخولون يمكنهم إنشاء حركات المستودع
CREATE POLICY "authorized_users_can_create_inventory_movements" ON inventory_movements
  FOR INSERT WITH CHECK (
    store_id = auth.current_user_store_id() AND
    auth.is_subscription_active(store_id) AND
    auth.has_permission('inventory.create')
  );

-- سياسات جدول الموظفين
-- Employees table policies

-- المستخدمون يمكنهم رؤية موظفي متجرهم فقط
CREATE POLICY "users_can_view_store_employees" ON employees
  FOR SELECT USING (
    store_id = auth.current_user_store_id() AND
    auth.is_subscription_active(store_id)
  );

-- المستخدمون المخولون يمكنهم إنشاء موظفين
CREATE POLICY "authorized_users_can_create_employees" ON employees
  FOR INSERT WITH CHECK (
    store_id = auth.current_user_store_id() AND
    auth.is_subscription_active(store_id) AND
    auth.has_permission('employees.create')
  );

-- المستخدمون المخولون يمكنهم تحديث الموظفين
CREATE POLICY "authorized_users_can_update_employees" ON employees
  FOR UPDATE USING (
    store_id = auth.current_user_store_id() AND
    auth.is_subscription_active(store_id) AND
    auth.has_permission('employees.update')
  );

-- سياسات جدول معاملات الموظفين
-- Employee transactions table policies

-- المستخدمون يمكنهم رؤية معاملات موظفي متجرهم فقط
CREATE POLICY "users_can_view_store_employee_transactions" ON employee_transactions
  FOR SELECT USING (
    store_id = auth.current_user_store_id() AND
    auth.is_subscription_active(store_id)
  );

-- المستخدمون المخولون يمكنهم إنشاء معاملات الموظفين
CREATE POLICY "authorized_users_can_create_employee_transactions" ON employee_transactions
  FOR INSERT WITH CHECK (
    store_id = auth.current_user_store_id() AND
    auth.is_subscription_active(store_id) AND
    auth.has_permission('payroll.create')
  );

-- المستخدمون المخولون يمكنهم تحديث معاملات الموظفين
CREATE POLICY "authorized_users_can_update_employee_transactions" ON employee_transactions
  FOR UPDATE USING (
    store_id = auth.current_user_store_id() AND
    auth.is_subscription_active(store_id) AND
    auth.has_permission('payroll.update')
  );

-- سياسات جدول كشوف الرواتب
-- Payroll table policies

-- المستخدمون يمكنهم رؤية كشوف رواتب متجرهم فقط
CREATE POLICY "users_can_view_store_payroll" ON payroll
  FOR SELECT USING (
    store_id = auth.current_user_store_id() AND
    auth.is_subscription_active(store_id)
  );

-- المستخدمون المخولون يمكنهم إنشاء كشوف الرواتب
CREATE POLICY "authorized_users_can_create_payroll" ON payroll
  FOR INSERT WITH CHECK (
    store_id = auth.current_user_store_id() AND
    auth.is_subscription_active(store_id) AND
    auth.has_permission('payroll.create')
  );

-- المستخدمون المخولون يمكنهم تحديث كشوف الرواتب
CREATE POLICY "authorized_users_can_update_payroll" ON payroll
  FOR UPDATE USING (
    store_id = auth.current_user_store_id() AND
    auth.is_subscription_active(store_id) AND
    auth.has_permission('payroll.update')
  );

-- سياسات جدول التنبيهات
-- Alerts table policies

-- المستخدمون يمكنهم رؤية تنبيهات متجرهم فقط
CREATE POLICY "users_can_view_store_alerts" ON alerts
  FOR SELECT USING (
    store_id = auth.current_user_store_id() AND
    (target_user_id = auth.current_user_id() OR target_user_id IS NULL)
  );

-- النظام يمكنه إنشاء التنبيهات
CREATE POLICY "system_can_create_alerts" ON alerts
  FOR INSERT WITH CHECK (TRUE);

-- المستخدمون يمكنهم تحديث حالة قراءة تنبيهاتهم
CREATE POLICY "users_can_update_own_alerts" ON alerts
  FOR UPDATE USING (
    store_id = auth.current_user_store_id() AND
    target_user_id = auth.current_user_id()
  );

-- سياسات جدول الإعدادات
-- Settings table policies

-- المستخدمون يمكنهم رؤية إعدادات متجرهم فقط
CREATE POLICY "users_can_view_store_settings" ON settings
  FOR SELECT USING (
    store_id = auth.current_user_store_id()
  );

-- المستخدمون المخولون يمكنهم تحديث الإعدادات
CREATE POLICY "authorized_users_can_update_settings" ON settings
  FOR ALL USING (
    store_id = auth.current_user_store_id() AND
    auth.current_user_role() IN ('system_owner', 'store_manager')
  );

-- محفزات تلقائية لتحديث المخزون
-- Automatic triggers for inventory updates

-- محفز لتحديث المخزون عند إضافة حركة
CREATE OR REPLACE FUNCTION update_inventory_stock()
RETURNS TRIGGER AS $$
BEGIN
  -- تحديث المخزون الحالي
  UPDATE inventory_items 
  SET 
    current_stock = current_stock + 
      CASE 
        WHEN NEW.movement_type = 'in' THEN NEW.quantity
        WHEN NEW.movement_type = 'out' THEN -NEW.quantity
        WHEN NEW.movement_type = 'adjustment' THEN NEW.quantity
        ELSE 0
      END,
    updated_at = NOW()
  WHERE id = NEW.item_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ربط المحفز بجدول حركات المستودع
CREATE TRIGGER trigger_update_inventory_stock
  AFTER INSERT ON inventory_movements
  FOR EACH ROW
  EXECUTE FUNCTION update_inventory_stock();

-- محفز لتسجيل العمليات تلقائياً
-- Trigger for automatic audit logging

CREATE OR REPLACE FUNCTION log_audit_trail()
RETURNS TRIGGER AS $$
BEGIN
  -- تسجيل العملية في سجل العمليات
  INSERT INTO audit_logs (
    store_id,
    user_id,
    action,
    entity_type,
    entity_id,
    old_data,
    new_data,
    ip_address
  ) VALUES (
    COALESCE(NEW.store_id, OLD.store_id),
    auth.current_user_id(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN to_jsonb(NEW) ELSE NULL END,
    inet_client_addr()
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ربط محفز تسجيل العمليات بالجداول المهمة
CREATE TRIGGER audit_stores AFTER INSERT OR UPDATE OR DELETE ON stores
  FOR EACH ROW EXECUTE FUNCTION log_audit_trail();

CREATE TRIGGER audit_users AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH ROW EXECUTE FUNCTION log_audit_trail();

CREATE TRIGGER audit_partners AFTER INSERT OR UPDATE OR DELETE ON partners
  FOR EACH ROW EXECUTE FUNCTION log_audit_trail();

CREATE TRIGGER audit_invoices_in AFTER INSERT OR UPDATE OR DELETE ON invoices_in
  FOR EACH ROW EXECUTE FUNCTION log_audit_trail();

CREATE TRIGGER audit_invoices_out AFTER INSERT OR UPDATE OR DELETE ON invoices_out
  FOR EACH ROW EXECUTE FUNCTION log_audit_trail();

CREATE TRIGGER audit_inventory_items AFTER INSERT OR UPDATE OR DELETE ON inventory_items
  FOR EACH ROW EXECUTE FUNCTION log_audit_trail();

CREATE TRIGGER audit_employees AFTER INSERT OR UPDATE OR DELETE ON employees
  FOR EACH ROW EXECUTE FUNCTION log_audit_trail();

CREATE TRIGGER audit_payroll AFTER INSERT OR UPDATE OR DELETE ON payroll
  FOR EACH ROW EXECUTE FUNCTION log_audit_trail();

-- محفز لتحديث updated_at تلقائياً
-- Trigger for automatic updated_at updates

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ربط محفز التحديث بالجداول
CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON stores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_partners_updated_at BEFORE UPDATE ON partners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_in_updated_at BEFORE UPDATE ON invoices_in
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_out_updated_at BEFORE UPDATE ON invoices_out
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON inventory_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employee_transactions_updated_at BEFORE UPDATE ON employee_transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payroll_updated_at BEFORE UPDATE ON payroll
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
