# 🏪 نظام إبراهيم للمحاسبة - Ibrahim Accounting System

نظام محاسبي شامل ومتكامل يدعم **متاجر متعددة** مع **عزل البيانات الكامل** ونظام **اشتراكات مدفوعة** مع تجربة مجانية 30 يوم.

## 🌟 الميزات الرئيسية

### 🔐 نظام المصادقة والأمان
- ✅ **Supabase Authentication** مع JWT tokens
- ✅ **Row Level Security (RLS)** لعزل بيانات المتاجر
- ✅ **Middleware شامل** للتحقق من الصلاحيات والاشتراكات
- ✅ **Audit Logging** تلقائي لجميع العمليات
- ✅ **bcrypt** لتشفير كلمات المرور (12 salt rounds)
- ✅ **Rate Limiting** وحماية من الهجمات

### 💳 نظام الاشتراكات المدفوعة
- ✅ **3 خطط اشتراك:**
  - 📅 **شهرية**: $5 لمدة 30 يوم
  - 📅 **نصف سنوية**: $30 لمدة 180 يوم (وفر 50%)
  - 📅 **سنوية**: $40 لمدة 365 يوم (وفر 67%)
- ✅ **تجربة مجانية** 30 يوم لكل متجر جديد
- ✅ **تكامل WhatsApp** للترقية والدعم الفني
- ✅ **تنبيهات تلقائية** لانتهاء الاشتراكات

### 🏪 نظام المتاجر المتعدد
- ✅ **عزل البيانات الكامل** بين المتاجر
- ✅ **صلاحيات متدرجة**: مالك النظام → مدير المتجر → موظفين
- ✅ **إدارة المستخدمين** مع صلاحيات دقيقة
- ✅ **ربط صلاحيات الموظفين** بمدة اشتراك المتجر

### 🌍 الترجمة والتدويل
- ✅ **3 لغات**: العربية، الإنجليزية، التركية
- ✅ **395 مفتاح ترجمة** شامل
- ✅ **دعم RTL** للعربية
- ✅ **تذكر اللغة المختارة**

### 💰 دعم العملات المتعددة
- ✅ **5 عملات**: SYP، USD، TRY، EUR، GBP
- ✅ **اختيار العملة** في كل عملية مالية
- ✅ **عرض الإجماليات** حسب العملة
- ✅ **رموز العملات** المحلية

## 🛠️ البنية التقنية

### Backend (Node.js + Express)
```
server/
├── config/supabase.js          # إعداد Supabase
├── middleware/auth.js          # المصادقة والصلاحيات
├── services/
│   ├── authService.js          # خدمة المصادقة
│   └── subscriptionService.js  # خدمة الاشتراكات
└── routes/
    ├── auth.js                 # نقاط نهاية المصادقة
    └── subscription.js         # نقاط نهاية الاشتراكات
```

### Frontend (React + Vite)
```
src/
├── contexts/AuthContext.jsx           # إدارة حالة المصادقة
├── components/
│   ├── Auth/LoginForm.jsx             # نموذج تسجيل الدخول
│   ├── Dashboard/Dashboard.jsx        # لوحة التحكم الرئيسية
│   └── Subscription/
│       ├── SubscriptionStatus.jsx     # عرض حالة الاشتراك
│       └── UpgradeModal.jsx          # نافذة ترقية الاشتراك
└── i18n/locales/                      # ملفات الترجمة
    ├── ar.json                        # العربية (395 مفتاح)
    ├── en.json                        # الإنجليزية
    └── tr.json                        # التركية
```

### Database (Supabase PostgreSQL)
```
supabase/
├── config.toml                        # إعداد Supabase
└── migrations/
    ├── 001_initial_schema.sql         # المخطط الأساسي (14 جدول)
    ├── 002_row_level_security.sql     # سياسات الأمان والـ RLS
    └── 003_seed_data.sql              # البيانات التجريبية
```

## 📊 قاعدة البيانات

### الجداول الرئيسية (14 جدول)
1. **currencies** - العملات المدعومة
2. **stores** - معلومات المتاجر وحالة الاشتراكات
3. **users** - بيانات المستخدمين والأدوار والصلاحيات
4. **audit_logs** - سجل جميع العمليات وتتبع التغييرات
5. **partners** - العملاء والموردين
6. **invoices_in** - الفواتير الواردة (المبيعات)
7. **invoices_out** - الفواتير الصادرة (المشتريات)
8. **inventory_items** - المنتجات بالمستودع
9. **inventory_movements** - حركات المخزون (إدخال/إخراج)
10. **employees** - بيانات الموظفين
11. **employee_transactions** - السلف والخصومات والمكافآت والغياب
12. **payroll** - كشوف الرواتب الشهرية
13. **alerts** - التنبيهات والإشعارات
14. **settings** - إعدادات النظام الشاملة

### الفهارس والأداء
- **40+ فهرس استراتيجي** على الحقول الشائعة
- **فهارس مركبة** على `(store_id, created_at)` للاستعلامات السريعة
- **فهارس على الحالات** `status`, `currency`, `type` للتصفية

## 🔒 الأمان والحماية

### Row Level Security (RLS)
- ✅ **عزل تام** لبيانات كل متجر
- ✅ **لا يمكن لأي مستخدم** الوصول لبيانات متجر آخر
- ✅ **سياسات أمان** على مستوى قاعدة البيانات

### Audit Logging
- ✅ **تسجيل جميع العمليات** تلقائياً
- ✅ **تتبع التغييرات** مع IP Address و User Agent
- ✅ **عدم إمكانية الحذف** إلا بموافقة مدير المتجر

### التحقق من الاشتراكات
- ✅ **فحص تلقائي** لصحة الاشتراك في كل طلب
- ✅ **منع الوصول** عند انتهاء الاشتراك
- ✅ **تنبيهات مسبقة** قبل انتهاء الاشتراك بـ 7 أيام

## 🚀 التشغيل والإعداد

### متطلبات النظام
- Node.js 18+ 
- npm أو yarn
- Supabase CLI
- Git

### متغيرات البيئة

#### Backend (.env)
```bash
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# WhatsApp Integration
WHATSAPP_PHONE_NUMBER=+963994054027

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=1h

# Server Configuration
PORT=5000
NODE_ENV=development
```

#### Frontend (.env)
```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# API Configuration
VITE_API_URL=http://localhost:5000/api

# App Configuration
VITE_APP_NAME="نظام إبراهيم للمحاسبة"
VITE_SUPPORT_EMAIL=systemibrahem@gmail.com
VITE_SUPPORT_PHONE=+963994054027
```

### خطوات التشغيل

#### 1. إعداد قاعدة البيانات
```bash
# تسجيل الدخول إلى Supabase
npx supabase login

# ربط المشروع
npx supabase link --project-ref your-project-ref

# تطبيق migrations
npx supabase db push

# أو تشغيل محلي
npx supabase start
```

#### 2. تشغيل Backend
```bash
cd server
npm install
npm run dev
```

#### 3. تشغيل Frontend
```bash
cd client
npm install
npm run dev
```

#### 4. الوصول للتطبيق
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Supabase Studio**: http://localhost:54323

## 📱 واجهة المستخدم

### 🎨 التصميم
- ✅ **Tailwind CSS** مع تصميم حديث
- ✅ **Dark Mode** قابل للتفعيل
- ✅ **Responsive Design** لجميع الأجهزة
- ✅ **Gradient Designs** احترافية

### 🔧 المكونات
- ✅ **نموذج تسجيل دخول** مع validation شامل
- ✅ **لوحة تحكم** مع KPI cards وإحصائيات
- ✅ **مكون حالة الاشتراك** مع تنبيهات ملونة
- ✅ **نافذة ترقية** مع مقارنة الخطط

## 📞 الدعم الفني

### 📧 معلومات الاتصال
- **البريد الإلكتروني**: systemibrahem@gmail.com
- **WhatsApp**: +963 994 054 027
- **تكامل مباشر** في جميع واجهات النظام

### 🤖 الترقية التلقائية
- ✅ **روابط WhatsApp** تلقائية مع تفاصيل المتجر والخطة
- ✅ **رسائل مُعدة مسبقاً** للترقية والدعم
- ✅ **تحويل مباشر** للدعم الفني

## 🧪 البيانات التجريبية

### المستخدمون التجريبيون
```
مدير المتجر:
- البريد: manager@ibrahim-accounting.com
- اسم المستخدم: manager
- كلمة المرور: manager123

المحاسب:
- البريد: accountant@ibrahim-accounting.com
- اسم المستخدم: accountant
- كلمة المرور: accountant123

مراقب المستودع:
- البريد: warehouse@ibrahim-accounting.com
- اسم المستخدم: warehouse
- كلمة المرور: warehouse123
```

### البيانات المتضمنة
- **5 عملات** مدعومة
- **متجر تجريبي** واحد مع تجربة مجانية 30 يوم
- **3 مستخدمين** بأدوار مختلفة
- **4 شركاء** (عملاء وموردين)
- **3 منتجات** في المستودع
- **4 فواتير** (واردة وصادرة)
- **3 موظفين** مع بيانات كاملة
- **3 تنبيهات** تجريبية
- **5 إعدادات** أساسية

## 🔄 API Endpoints

### المصادقة
```
POST /api/auth/login          # تسجيل الدخول
POST /api/auth/refresh        # تجديد الرمز
POST /api/auth/logout         # تسجيل الخروج
GET  /api/auth/profile        # الملف الشخصي
PUT  /api/auth/profile        # تحديث الملف الشخصي
```

### الاشتراكات
```
GET  /api/subscription/plans           # خطط الاشتراك
GET  /api/subscription/status          # حالة الاشتراك
POST /api/subscription/whatsapp-upgrade # رابط ترقية WhatsApp
```

### الفواتير (قادماً)
```
GET    /api/invoices/in               # الفواتير الواردة
POST   /api/invoices/in               # إنشاء فاتورة واردة
GET    /api/invoices/in/:id           # فاتورة واردة محددة
PUT    /api/invoices/in/:id           # تحديث فاتورة واردة
DELETE /api/invoices/in/:id           # حذف فاتورة واردة

GET    /api/invoices/out              # الفواتير الصادرة
POST   /api/invoices/out              # إنشاء فاتورة صادرة
GET    /api/invoices/out/:id          # فاتورة صادرة محددة
PUT    /api/invoices/out/:id          # تحديث فاتورة صادرة
DELETE /api/invoices/out/:id          # حذف فاتورة صادرة
```

## 🎯 الخطوات التالية

### المرحلة القادمة
1. **تطوير باقي API endpoints** (الفواتير، المستودع، الموظفين)
2. **إنشاء مكونات React إضافية** للواجهة الأمامية
3. **نظام التقارير والتصدير** PDF/Excel
4. **نظام التنبيهات والإشعارات** الذكية
5. **تطبيق الأندرويد** React Native/Flutter

### الميزات المطلوبة
- 📊 **إدارة الواردات والصادرات**
- 📦 **إدارة المستودع والمخزون**
- 👥 **إدارة الموظفين والرواتب**
- 📈 **التقارير والإحصائيات**
- 🔔 **التنبيهات الذكية**
- 📱 **تطبيق الأندرويد**

## 🤝 المساهمة

نرحب بالمساهمات! يرجى اتباع هذه الخطوات:

1. Fork المشروع
2. إنشاء branch للميزة (`git checkout -b feature/AmazingFeature`)
3. Commit التغييرات (`git commit -m 'Add some AmazingFeature'`)
4. Push إلى Branch (`git push origin feature/AmazingFeature`)
5. فتح Pull Request

## 📄 الترخيص

هذا المشروع مرخص تحت رخصة MIT - راجع ملف [LICENSE](LICENSE) للتفاصيل.

## 🙏 شكر وتقدير

- [Supabase](https://supabase.com/) - قاعدة البيانات والمصادقة
- [React](https://reactjs.org/) - مكتبة واجهة المستخدم
- [Tailwind CSS](https://tailwindcss.com/) - إطار عمل CSS
- [Vite](https://vitejs.dev/) - أداة البناء
- [Node.js](https://nodejs.org/) - بيئة تشغيل JavaScript

---

**🎉 النظام جاهز للاستخدام والتطوير!**

للدعم الفني: [systemibrahem@gmail.com](mailto:systemibrahem@gmail.com) | [WhatsApp](https://wa.me/963994054027)

