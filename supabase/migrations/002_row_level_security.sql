-- نظام إبراهيم للمحاسبة - Row Level Security
-- Ibrahim Accounting System - Row Level Security Setup

-- تفعيل RLS على جميع الجداول
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

-- إنشاء دالة للحصول على store_id للمستخدم الحالي
CREATE OR REPLACE FUNCTION get_current_store_id()
RETURNS UUID AS $$
DECLARE
    store_id UUID;
BEGIN
    SELECT u.store_id INTO store_id
    FROM users u
    WHERE u.id = auth.uid();
    
    RETURN store_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- إنشاء دالة للتحقق من صلاحية المستخدم
CREATE OR REPLACE FUNCTION check_user_role(required_role TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT u.role INTO user_role
    FROM users u
    WHERE u.id = auth.uid();
    
    RETURN user_role = required_role OR user_role = 'system_owner' OR user_role = 'store_manager';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- إنشاء دالة للتحقق من صحة الاشتراك
CREATE OR REPLACE FUNCTION check_subscription_active()
RETURNS BOOLEAN AS $$
DECLARE
    is_active BOOLEAN := false;
    store_id UUID;
BEGIN
    SELECT get_current_store_id() INTO store_id;
    
    IF store_id IS NULL THEN
        RETURN false;
    END IF;
    
    SELECT 
        (subscription_status = 'active' OR subscription_status = 'trial') 
        AND subscription_end_date > NOW()
    INTO is_active
    FROM stores s
    WHERE s.id = store_id;
    
    RETURN COALESCE(is_active, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- سياسات RLS للمتاجر
CREATE POLICY "Users can view their own store" ON stores
    FOR SELECT USING (
        id = get_current_store_id() OR 
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'system_owner')
    );

CREATE POLICY "Store managers can update their store" ON stores
    FOR UPDATE USING (
        id = get_current_store_id() AND check_user_role('store_manager')
    );

-- سياسات RLS للمستخدمين
CREATE POLICY "Users can view users in their store" ON users
    FOR SELECT USING (
        store_id = get_current_store_id() OR 
        id = auth.uid() OR
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'system_owner')
    );

CREATE POLICY "Store managers can manage users in their store" ON users
    FOR ALL USING (
        store_id = get_current_store_id() AND 
        (check_user_role('store_manager') OR check_user_role('system_owner'))
    );

-- سياسات RLS لسجل العمليات
CREATE POLICY "Users can view audit logs in their store" ON audit_logs
    FOR SELECT USING (
        store_id = get_current_store_id() AND check_subscription_active()
    );

CREATE POLICY "System creates audit logs" ON audit_logs
    FOR INSERT WITH CHECK (
        store_id = get_current_store_id()
    );

-- سياسات RLS للشركاء
CREATE POLICY "Users can manage partners in their store" ON partners
    FOR ALL USING (
        store_id = get_current_store_id() AND check_subscription_active()
    );

-- سياسات RLS للواردات
CREATE POLICY "Users can manage invoices_in in their store" ON invoices_in
    FOR ALL USING (
        store_id = get_current_store_id() AND check_subscription_active()
    );

-- سياسات RLS للصادرات
CREATE POLICY "Users can manage invoices_out in their store" ON invoices_out
    FOR ALL USING (
        store_id = get_current_store_id() AND check_subscription_active()
    );

-- سياسات RLS للمنتجات
CREATE POLICY "Users can manage inventory_items in their store" ON inventory_items
    FOR ALL USING (
        store_id = get_current_store_id() AND check_subscription_active()
    );

-- سياسات RLS لحركات المخزون
CREATE POLICY "Users can manage inventory_movements in their store" ON inventory_movements
    FOR ALL USING (
        store_id = get_current_store_id() AND check_subscription_active()
    );

-- سياسات RLS للموظفين
CREATE POLICY "Users can manage employees in their store" ON employees
    FOR ALL USING (
        store_id = get_current_store_id() AND check_subscription_active()
    );

-- سياسات RLS لمعاملات الموظفين
CREATE POLICY "Users can manage employee_transactions in their store" ON employee_transactions
    FOR ALL USING (
        store_id = get_current_store_id() AND check_subscription_active()
    );

-- سياسات RLS لكشوف الرواتب
CREATE POLICY "Users can manage payroll in their store" ON payroll
    FOR ALL USING (
        store_id = get_current_store_id() AND check_subscription_active()
    );

-- سياسات RLS للتنبيهات
CREATE POLICY "Users can view alerts in their store" ON alerts
    FOR SELECT USING (
        store_id = get_current_store_id() AND 
        (target_user_id = auth.uid() OR target_role IS NULL OR 
         EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = target_role))
    );

CREATE POLICY "System can create alerts" ON alerts
    FOR INSERT WITH CHECK (
        store_id = get_current_store_id()
    );

CREATE POLICY "Users can update their alerts" ON alerts
    FOR UPDATE USING (
        store_id = get_current_store_id() AND 
        (target_user_id = auth.uid() OR check_user_role('store_manager'))
    );

-- سياسات RLS للإعدادات
CREATE POLICY "Users can view settings in their store" ON settings
    FOR SELECT USING (
        store_id = get_current_store_id()
    );

CREATE POLICY "Store managers can manage settings" ON settings
    FOR ALL USING (
        store_id = get_current_store_id() AND check_user_role('store_manager')
    );

-- إنشاء دالة لتسجيل العمليات تلقائياً
CREATE OR REPLACE FUNCTION log_audit_trail()
RETURNS TRIGGER AS $$
DECLARE
    store_id UUID;
    old_data JSONB;
    new_data JSONB;
BEGIN
    -- الحصول على store_id
    IF TG_OP = 'DELETE' THEN
        store_id := OLD.store_id;
        old_data := to_jsonb(OLD);
        new_data := NULL;
    ELSE
        store_id := NEW.store_id;
        new_data := to_jsonb(NEW);
        IF TG_OP = 'UPDATE' THEN
            old_data := to_jsonb(OLD);
        ELSE
            old_data := NULL;
        END IF;
    END IF;

    -- إدراج سجل العملية
    INSERT INTO audit_logs (
        store_id,
        user_id,
        action,
        entity_type,
        entity_id,
        old_data,
        new_data,
        ip_address,
        user_agent
    ) VALUES (
        store_id,
        auth.uid(),
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        old_data,
        new_data,
        inet_client_addr(),
        current_setting('request.headers', true)::json->>'user-agent'
    );

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- إنشاء المحفزات لتسجيل العمليات
CREATE TRIGGER audit_partners_trigger
    AFTER INSERT OR UPDATE OR DELETE ON partners
    FOR EACH ROW EXECUTE FUNCTION log_audit_trail();

CREATE TRIGGER audit_invoices_in_trigger
    AFTER INSERT OR UPDATE OR DELETE ON invoices_in
    FOR EACH ROW EXECUTE FUNCTION log_audit_trail();

CREATE TRIGGER audit_invoices_out_trigger
    AFTER INSERT OR UPDATE OR DELETE ON invoices_out
    FOR EACH ROW EXECUTE FUNCTION log_audit_trail();

CREATE TRIGGER audit_inventory_items_trigger
    AFTER INSERT OR UPDATE OR DELETE ON inventory_items
    FOR EACH ROW EXECUTE FUNCTION log_audit_trail();

CREATE TRIGGER audit_inventory_movements_trigger
    AFTER INSERT OR UPDATE OR DELETE ON inventory_movements
    FOR EACH ROW EXECUTE FUNCTION log_audit_trail();

CREATE TRIGGER audit_employees_trigger
    AFTER INSERT OR UPDATE OR DELETE ON employees
    FOR EACH ROW EXECUTE FUNCTION log_audit_trail();

CREATE TRIGGER audit_employee_transactions_trigger
    AFTER INSERT OR UPDATE OR DELETE ON employee_transactions
    FOR EACH ROW EXECUTE FUNCTION log_audit_trail();

CREATE TRIGGER audit_payroll_trigger
    AFTER INSERT OR UPDATE OR DELETE ON payroll
    FOR EACH ROW EXECUTE FUNCTION log_audit_trail();

-- إنشاء دالة لتحديث المخزون تلقائياً
CREATE OR REPLACE FUNCTION update_inventory_stock()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- تحديث المخزون عند إضافة حركة جديدة
        IF NEW.type = 'in' THEN
            UPDATE inventory_items 
            SET current_stock = current_stock + NEW.quantity,
                updated_at = NOW()
            WHERE id = NEW.item_id;
        ELSIF NEW.type = 'out' THEN
            UPDATE inventory_items 
            SET current_stock = current_stock - NEW.quantity,
                updated_at = NOW()
            WHERE id = NEW.item_id;
        ELSIF NEW.type = 'adjustment' THEN
            UPDATE inventory_items 
            SET current_stock = NEW.quantity,
                updated_at = NOW()
            WHERE id = NEW.item_id;
        END IF;
    ELSIF TG_OP = 'UPDATE' THEN
        -- تحديث المخزون عند تعديل حركة موجودة
        -- إلغاء الحركة القديمة
        IF OLD.type = 'in' THEN
            UPDATE inventory_items 
            SET current_stock = current_stock - OLD.quantity
            WHERE id = OLD.item_id;
        ELSIF OLD.type = 'out' THEN
            UPDATE inventory_items 
            SET current_stock = current_stock + OLD.quantity
            WHERE id = OLD.item_id;
        END IF;
        
        -- تطبيق الحركة الجديدة
        IF NEW.type = 'in' THEN
            UPDATE inventory_items 
            SET current_stock = current_stock + NEW.quantity,
                updated_at = NOW()
            WHERE id = NEW.item_id;
        ELSIF NEW.type = 'out' THEN
            UPDATE inventory_items 
            SET current_stock = current_stock - NEW.quantity,
                updated_at = NOW()
            WHERE id = NEW.item_id;
        ELSIF NEW.type = 'adjustment' THEN
            UPDATE inventory_items 
            SET current_stock = NEW.quantity,
                updated_at = NOW()
            WHERE id = NEW.item_id;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        -- إلغاء الحركة المحذوفة
        IF OLD.type = 'in' THEN
            UPDATE inventory_items 
            SET current_stock = current_stock - OLD.quantity,
                updated_at = NOW()
            WHERE id = OLD.item_id;
        ELSIF OLD.type = 'out' THEN
            UPDATE inventory_items 
            SET current_stock = current_stock + OLD.quantity,
                updated_at = NOW()
            WHERE id = OLD.item_id;
        END IF;
    END IF;

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- إنشاء محفز تحديث المخزون
CREATE TRIGGER update_inventory_stock_trigger
    AFTER INSERT OR UPDATE OR DELETE ON inventory_movements
    FOR EACH ROW EXECUTE FUNCTION update_inventory_stock();

-- إنشاء دالة للتحقق من نقص المخزون وإنشاء تنبيهات
CREATE OR REPLACE FUNCTION check_low_stock()
RETURNS TRIGGER AS $$
BEGIN
    -- التحقق من نقص المخزون بعد التحديث
    IF NEW.current_stock <= NEW.min_stock AND NEW.min_stock > 0 THEN
        INSERT INTO alerts (
            store_id,
            type,
            title,
            message,
            severity,
            entity_type,
            entity_id,
            target_role
        ) VALUES (
            NEW.store_id,
            'low_stock',
            'نقص في المخزون - ' || NEW.name,
            'المنتج "' || NEW.name || '" وصل إلى الحد الأدنى للمخزون. الكمية الحالية: ' || NEW.current_stock || ', الحد الأدنى: ' || NEW.min_stock,
            'warning',
            'inventory_items',
            NEW.id,
            'warehouse_manager'
        )
        ON CONFLICT DO NOTHING; -- تجنب التكرار
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- إنشاء محفز التحقق من نقص المخزون
CREATE TRIGGER check_low_stock_trigger
    AFTER UPDATE OF current_stock ON inventory_items
    FOR EACH ROW EXECUTE FUNCTION check_low_stock();
