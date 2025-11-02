-- نظام إبراهيم للمحاسبة - إنشاء الفهارس للأداء
-- Ibrahim Accounting System - Performance Indexes

-- فهارس جدول المستخدمين
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_store_owner_id ON users(store_owner_id);
CREATE INDEX idx_users_subscription_expires_at ON users(subscription_expires_at);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

-- فهارس جدول سجل النشاطات
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX idx_audit_logs_entity_id ON audit_logs(entity_id);

-- فهارس جدول الشركاء
CREATE INDEX idx_partners_store_owner_id ON partners(store_owner_id);
CREATE INDEX idx_partners_type ON partners(type);
CREATE INDEX idx_partners_name ON partners(name);
CREATE INDEX idx_partners_is_active ON partners(is_active);

-- فهارس جدول الفواتير الواردة
CREATE INDEX idx_invoices_in_store_owner_id ON invoices_in(store_owner_id);
CREATE INDEX idx_invoices_in_vendor_id ON invoices_in(vendor_id);
CREATE INDEX idx_invoices_in_date ON invoices_in(date);
CREATE INDEX idx_invoices_in_due_date ON invoices_in(due_date);
CREATE INDEX idx_invoices_in_status ON invoices_in(status);
CREATE INDEX idx_invoices_in_currency ON invoices_in(currency);
CREATE INDEX idx_invoices_in_category ON invoices_in(category);
CREATE INDEX idx_invoices_in_created_at ON invoices_in(created_at);
CREATE INDEX idx_invoices_in_amount ON invoices_in(amount);

-- فهارس جدول الفواتير الصادرة
CREATE INDEX idx_invoices_out_store_owner_id ON invoices_out(store_owner_id);
CREATE INDEX idx_invoices_out_customer_id ON invoices_out(customer_id);
CREATE INDEX idx_invoices_out_date ON invoices_out(date);
CREATE INDEX idx_invoices_out_due_date ON invoices_out(due_date);
CREATE INDEX idx_invoices_out_status ON invoices_out(status);
CREATE INDEX idx_invoices_out_currency ON invoices_out(currency);
CREATE INDEX idx_invoices_out_category ON invoices_out(category);
CREATE INDEX idx_invoices_out_created_at ON invoices_out(created_at);
CREATE INDEX idx_invoices_out_amount ON invoices_out(amount);

-- فهارس جدول المنتجات والمخزون
CREATE INDEX idx_inventory_items_store_owner_id ON inventory_items(store_owner_id);
CREATE INDEX idx_inventory_items_sku ON inventory_items(sku);
CREATE INDEX idx_inventory_items_name ON inventory_items(name);
CREATE INDEX idx_inventory_items_category ON inventory_items(category);
CREATE INDEX idx_inventory_items_is_active ON inventory_items(is_active);
CREATE INDEX idx_inventory_items_current_stock ON inventory_items(current_stock);
CREATE INDEX idx_inventory_items_min_stock ON inventory_items(min_stock);

-- فهارس جدول حركات المخزون
CREATE INDEX idx_inventory_movements_store_owner_id ON inventory_movements(store_owner_id);
CREATE INDEX idx_inventory_movements_item_id ON inventory_movements(item_id);
CREATE INDEX idx_inventory_movements_type ON inventory_movements(type);
CREATE INDEX idx_inventory_movements_date ON inventory_movements(date);
CREATE INDEX idx_inventory_movements_created_at ON inventory_movements(created_at);
CREATE INDEX idx_inventory_movements_related_invoice_id ON inventory_movements(related_invoice_id);

-- فهارس جدول الموظفين
CREATE INDEX idx_employees_store_owner_id ON employees(store_owner_id);
CREATE INDEX idx_employees_user_id ON employees(user_id);
CREATE INDEX idx_employees_employee_number ON employees(employee_number);
CREATE INDEX idx_employees_name ON employees(name);
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_employees_hire_date ON employees(hire_date);
CREATE INDEX idx_employees_department ON employees(department);

-- فهارس جدول معاملات الموظفين
CREATE INDEX idx_employee_transactions_store_owner_id ON employee_transactions(store_owner_id);
CREATE INDEX idx_employee_transactions_employee_id ON employee_transactions(employee_id);
CREATE INDEX idx_employee_transactions_type ON employee_transactions(type);
CREATE INDEX idx_employee_transactions_date ON employee_transactions(date);
CREATE INDEX idx_employee_transactions_status ON employee_transactions(status);
CREATE INDEX idx_employee_transactions_created_at ON employee_transactions(created_at);

-- فهارس جدول كشوف الرواتب
CREATE INDEX idx_payroll_store_owner_id ON payroll(store_owner_id);
CREATE INDEX idx_payroll_employee_id ON payroll(employee_id);
CREATE INDEX idx_payroll_period ON payroll(period_year, period_month);
CREATE INDEX idx_payroll_status ON payroll(status);
CREATE INDEX idx_payroll_created_at ON payroll(created_at);

-- فهارس جدول التنبيهات
CREATE INDEX idx_alerts_store_owner_id ON alerts(store_owner_id);
CREATE INDEX idx_alerts_user_id ON alerts(user_id);
CREATE INDEX idx_alerts_type ON alerts(type);
CREATE INDEX idx_alerts_priority ON alerts(priority);
CREATE INDEX idx_alerts_is_read ON alerts(is_read);
CREATE INDEX idx_alerts_created_at ON alerts(created_at);
CREATE INDEX idx_alerts_expires_at ON alerts(expires_at);

-- فهارس جدول الإعدادات
CREATE INDEX idx_settings_store_owner_id ON settings(store_owner_id);
CREATE INDEX idx_settings_key ON settings(key);

-- فهارس مركبة للاستعلامات الشائعة
CREATE INDEX idx_invoices_in_store_date ON invoices_in(store_owner_id, date);
CREATE INDEX idx_invoices_out_store_date ON invoices_out(store_owner_id, date);
CREATE INDEX idx_inventory_movements_item_date ON inventory_movements(item_id, date);
CREATE INDEX idx_employee_transactions_emp_date ON employee_transactions(employee_id, date);
CREATE INDEX idx_payroll_store_period ON payroll(store_owner_id, period_year, period_month);

-- فهارس للبحث النصي
CREATE INDEX idx_partners_name_gin ON partners USING gin(to_tsvector('arabic', name));
CREATE INDEX idx_inventory_items_name_gin ON inventory_items USING gin(to_tsvector('arabic', name));
CREATE INDEX idx_employees_name_gin ON employees USING gin(to_tsvector('arabic', name));

