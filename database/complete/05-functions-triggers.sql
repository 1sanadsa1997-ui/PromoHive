-- نظام إبراهيم للمحاسبة - الدوال والمحفزات
-- Ibrahim Accounting System - Functions and Triggers

-- دالة تحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- إضافة محفزات تحديث updated_at
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

-- دالة تحديث المخزون عند حركة المخزون
CREATE OR REPLACE FUNCTION update_inventory_stock()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- تحديث المخزون الحالي
        UPDATE inventory_items 
        SET current_stock = current_stock + 
            CASE 
                WHEN NEW.type = 'in' THEN NEW.quantity
                WHEN NEW.type = 'out' THEN -NEW.quantity
                ELSE NEW.quantity -- للتعديلات
            END,
            updated_at = NOW()
        WHERE id = NEW.item_id;
        
        -- إنشاء تنبيه إذا انخفض المخزون عن الحد الأدنى
        INSERT INTO alerts (
            store_owner_id,
            type,
            title,
            message,
            priority
        )
        SELECT 
            NEW.store_owner_id,
            'low_stock',
            'نقص في المخزون',
            'المنتج ' || ii.name || ' (' || ii.sku || ') أصبح أقل من الحد الأدنى المطلوب.',
            'medium'
        FROM inventory_items ii
        WHERE ii.id = NEW.item_id 
        AND ii.current_stock <= ii.min_stock
        AND NEW.type = 'out';
        
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- محفز تحديث المخزون
CREATE TRIGGER trigger_update_inventory_stock
    AFTER INSERT ON inventory_movements
    FOR EACH ROW EXECUTE FUNCTION update_inventory_stock();

-- دالة حساب الراتب الصافي
CREATE OR REPLACE FUNCTION calculate_net_salary(
    p_employee_id UUID,
    p_period_month INTEGER,
    p_period_year INTEGER
)
RETURNS DECIMAL(15,2) AS $$
DECLARE
    v_gross_salary DECIMAL(15,2);
    v_total_advances DECIMAL(15,2) := 0;
    v_total_absences DECIMAL(15,2) := 0;
    v_total_deductions DECIMAL(15,2) := 0;
    v_total_bonuses DECIMAL(15,2) := 0;
    v_total_overtime DECIMAL(15,2) := 0;
    v_net_salary DECIMAL(15,2);
BEGIN
    -- الحصول على الراتب الأساسي
    SELECT base_salary INTO v_gross_salary
    FROM employees
    WHERE id = p_employee_id;
    
    -- حساب إجمالي السلف
    SELECT COALESCE(SUM(amount), 0) INTO v_total_advances
    FROM employee_transactions
    WHERE employee_id = p_employee_id
    AND type = 'advance'
    AND status = 'approved'
    AND EXTRACT(MONTH FROM date) = p_period_month
    AND EXTRACT(YEAR FROM date) = p_period_year;
    
    -- حساب إجمالي الغياب
    SELECT COALESCE(SUM(amount), 0) INTO v_total_absences
    FROM employee_transactions
    WHERE employee_id = p_employee_id
    AND type = 'absence'
    AND status = 'approved'
    AND EXTRACT(MONTH FROM date) = p_period_month
    AND EXTRACT(YEAR FROM date) = p_period_year;
    
    -- حساب إجمالي الخصومات
    SELECT COALESCE(SUM(amount), 0) INTO v_total_deductions
    FROM employee_transactions
    WHERE employee_id = p_employee_id
    AND type = 'deduction'
    AND status = 'approved'
    AND EXTRACT(MONTH FROM date) = p_period_month
    AND EXTRACT(YEAR FROM date) = p_period_year;
    
    -- حساب إجمالي المكافآت
    SELECT COALESCE(SUM(amount), 0) INTO v_total_bonuses
    FROM employee_transactions
    WHERE employee_id = p_employee_id
    AND type = 'bonus'
    AND status = 'approved'
    AND EXTRACT(MONTH FROM date) = p_period_month
    AND EXTRACT(YEAR FROM date) = p_period_year;
    
    -- حساب إجمالي الإضافي
    SELECT COALESCE(SUM(amount), 0) INTO v_total_overtime
    FROM employee_transactions
    WHERE employee_id = p_employee_id
    AND type = 'overtime'
    AND status = 'approved'
    AND EXTRACT(MONTH FROM date) = p_period_month
    AND EXTRACT(YEAR FROM date) = p_period_year;
    
    -- حساب الراتب الصافي
    v_net_salary := v_gross_salary + v_total_bonuses + v_total_overtime 
                   - v_total_advances - v_total_absences - v_total_deductions;
    
    RETURN v_net_salary;
END;
$$ LANGUAGE plpgsql;

-- دالة إنشاء كشف راتب
CREATE OR REPLACE FUNCTION generate_payroll(
    p_store_owner_id UUID,
    p_employee_id UUID,
    p_period_month INTEGER,
    p_period_year INTEGER,
    p_created_by UUID
)
RETURNS UUID AS $$
DECLARE
    v_payroll_id UUID;
    v_employee_record RECORD;
    v_gross_salary DECIMAL(15,2);
    v_total_advances DECIMAL(15,2) := 0;
    v_total_absences DECIMAL(15,2) := 0;
    v_total_deductions DECIMAL(15,2) := 0;
    v_total_bonuses DECIMAL(15,2) := 0;
    v_total_overtime DECIMAL(15,2) := 0;
    v_net_salary DECIMAL(15,2);
BEGIN
    -- التحقق من وجود الموظف
    SELECT * INTO v_employee_record
    FROM employees
    WHERE id = p_employee_id AND store_owner_id = p_store_owner_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'الموظف غير موجود';
    END IF;
    
    -- التحقق من عدم وجود كشف راتب للفترة نفسها
    IF EXISTS (
        SELECT 1 FROM payroll
        WHERE employee_id = p_employee_id
        AND period_month = p_period_month
        AND period_year = p_period_year
    ) THEN
        RAISE EXCEPTION 'كشف راتب موجود بالفعل لهذه الفترة';
    END IF;
    
    v_gross_salary := v_employee_record.base_salary;
    
    -- حساب المعاملات
    SELECT 
        COALESCE(SUM(CASE WHEN type = 'advance' THEN amount ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN type = 'absence' THEN amount ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN type = 'deduction' THEN amount ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN type = 'bonus' THEN amount ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN type = 'overtime' THEN amount ELSE 0 END), 0)
    INTO 
        v_total_advances,
        v_total_absences,
        v_total_deductions,
        v_total_bonuses,
        v_total_overtime
    FROM employee_transactions
    WHERE employee_id = p_employee_id
    AND status = 'approved'
    AND EXTRACT(MONTH FROM date) = p_period_month
    AND EXTRACT(YEAR FROM date) = p_period_year;
    
    -- حساب الراتب الصافي
    v_net_salary := v_gross_salary + v_total_bonuses + v_total_overtime 
                   - v_total_advances - v_total_absences - v_total_deductions;
    
    -- إنشاء كشف الراتب
    INSERT INTO payroll (
        store_owner_id,
        employee_id,
        period_month,
        period_year,
        gross_salary,
        total_advances,
        total_absences,
        total_deductions,
        total_bonuses,
        total_overtime,
        net_salary,
        currency,
        created_by
    ) VALUES (
        p_store_owner_id,
        p_employee_id,
        p_period_month,
        p_period_year,
        v_gross_salary,
        v_total_advances,
        v_total_absences,
        v_total_deductions,
        v_total_bonuses,
        v_total_overtime,
        v_net_salary,
        v_employee_record.currency,
        p_created_by
    ) RETURNING id INTO v_payroll_id;
    
    RETURN v_payroll_id;
END;
$$ LANGUAGE plpgsql;

-- دالة تسجيل النشاطات
CREATE OR REPLACE FUNCTION log_activity(
    p_user_id UUID,
    p_action VARCHAR(50),
    p_entity_type VARCHAR(50),
    p_entity_id UUID DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO audit_logs (
        user_id,
        action,
        entity_type,
        entity_id,
        metadata
    ) VALUES (
        p_user_id,
        p_action,
        p_entity_type,
        p_entity_id,
        p_metadata
    ) RETURNING id INTO v_log_id;
    
    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql;

-- دالة التحقق من انتهاء الاشتراك
CREATE OR REPLACE FUNCTION check_subscription_expiry()
RETURNS VOID AS $$
BEGIN
    -- إنشاء تنبيهات للاشتراكات التي ستنتهي خلال 7 أيام
    INSERT INTO alerts (
        store_owner_id,
        user_id,
        type,
        title,
        message,
        priority
    )
    SELECT 
        u.id,
        u.id,
        'subscription_expiry',
        'انتهاء الاشتراك قريباً',
        'سينتهي اشتراكك خلال ' || 
        EXTRACT(DAY FROM (u.subscription_expires_at - NOW())) || 
        ' أيام. قم بتجديد اشتراكك للاستمرار.',
        CASE 
            WHEN u.subscription_expires_at - NOW() <= INTERVAL '3 days' THEN 'urgent'
            WHEN u.subscription_expires_at - NOW() <= INTERVAL '7 days' THEN 'high'
            ELSE 'medium'
        END
    FROM users u
    WHERE u.role = 'store_owner'
    AND u.subscription_expires_at <= NOW() + INTERVAL '7 days'
    AND u.subscription_expires_at > NOW()
    AND NOT EXISTS (
        SELECT 1 FROM alerts a
        WHERE a.store_owner_id = u.id
        AND a.type = 'subscription_expiry'
        AND a.created_at > NOW() - INTERVAL '1 day'
    );
END;
$$ LANGUAGE plpgsql;

-- دالة إحصائيات لوحة التحكم
CREATE OR REPLACE FUNCTION get_dashboard_stats(p_store_owner_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_stats JSONB := '{}';
    v_current_month_start DATE := DATE_TRUNC('month', CURRENT_DATE);
    v_last_month_start DATE := DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month');
BEGIN
    -- إجمالي الإيرادات هذا الشهر
    SELECT COALESCE(
        jsonb_object_agg(
            currency,
            total_amount
        ), '{}'
    ) INTO v_stats
    FROM (
        SELECT 
            currency,
            SUM(amount) as total_amount
        FROM invoices_out
        WHERE store_owner_id = p_store_owner_id
        AND date >= v_current_month_start
        AND status = 'paid'
        GROUP BY currency
    ) revenue;
    
    -- إضافة إحصائيات أخرى
    v_stats := v_stats || jsonb_build_object(
        'total_customers', (
            SELECT COUNT(*) FROM partners 
            WHERE store_owner_id = p_store_owner_id AND type = 'customer'
        ),
        'total_vendors', (
            SELECT COUNT(*) FROM partners 
            WHERE store_owner_id = p_store_owner_id AND type = 'vendor'
        ),
        'total_employees', (
            SELECT COUNT(*) FROM employees 
            WHERE store_owner_id = p_store_owner_id AND status = 'active'
        ),
        'low_stock_items', (
            SELECT COUNT(*) FROM inventory_items 
            WHERE store_owner_id = p_store_owner_id 
            AND current_stock <= min_stock
            AND is_active = true
        ),
        'pending_invoices_out', (
            SELECT COUNT(*) FROM invoices_out 
            WHERE store_owner_id = p_store_owner_id AND status = 'pending'
        ),
        'overdue_invoices_out', (
            SELECT COUNT(*) FROM invoices_out 
            WHERE store_owner_id = p_store_owner_id 
            AND status = 'pending' 
            AND due_date < CURRENT_DATE
        )
    );
    
    RETURN v_stats;
END;
$$ LANGUAGE plpgsql;

