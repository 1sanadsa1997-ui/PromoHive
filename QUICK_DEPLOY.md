# 🚀 PromoHive - خطوات النشر السريع على الخادم

## 📋 المتطلبات الأساسية

### الخادم المستهدف
- **العنوان:** int.hostingervps.com
- **المستخدم:** root
- **المجلد:** /var/www/promohive

## 🔧 خطوات النشر السريع

### 1. الاتصال بالخادم
```bash
ssh root@int.hostingervps.com
```

### 2. تحديث النظام
```bash
apt update && apt upgrade -y
```

### 3. تثبيت Docker
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
systemctl start docker
systemctl enable docker
```

### 4. تثبيت Node.js و pnpm
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs
npm install -g pnpm
```

### 5. مسح المحتويات السابقة (إن وجدت)
```bash
cd /var/www
rm -rf promohive
```

### 6. استنساخ المشروع
```bash
git clone https://github.com/1sanadsa1997-ui/PromoHive.git promohive
cd promohive
```

### 7. إعداد متغيرات البيئة
```bash
cp env.production .env
```

### 8. تثبيت التبعيات وبناء المشروع
```bash
pnpm install --frozen-lockfile
pnpm prisma generate
pnpm build
```

### 9. إنشاء المجلدات المطلوبة
```bash
mkdir -p uploads logs ssl
chmod 755 uploads logs ssl
```

### 10. إنشاء شهادات SSL
```bash
cd ssl
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes \
    -subj '/C=US/ST=State/L=City/O=Organization/CN=int.hostingervps.com'
chmod 600 key.pem
chmod 644 cert.pem
```

### 11. تشغيل الخدمات
```bash
cd /var/www/promohive
docker-compose up -d --build
```

### 12. تشغيل migrations قاعدة البيانات
```bash
docker-compose exec promohive pnpm prisma migrate deploy
```

### 13. إضافة البيانات الأولية
```bash
docker-compose exec promohive npx tsx prisma/seed.ts
```

## 🔍 التحقق من النشر

### فحص حالة الخدمات
```bash
docker-compose ps
```

### فحص السجلات
```bash
docker-compose logs promohive
```

### اختبار التطبيق
```bash
curl -f https://int.hostingervps.com/api/ping
```

## 🔐 بيانات الدخول الافتراضية

### Super Admin
- **البريد الإلكتروني:** admin@promohive.com
- **كلمة المرور:** admin123
- **الرابط:** https://int.hostingervps.com/admin

### مستخدم تجريبي
- **البريد الإلكتروني:** demo@promohive.com
- **كلمة المرور:** user123
- **الرابط:** https://int.hostingervps.com

## 🛠️ أوامر الإدارة

### إيقاف الخدمات
```bash
docker-compose down
```

### إعادة تشغيل الخدمات
```bash
docker-compose restart
```

### تحديث المشروع
```bash
git pull origin main
docker-compose up -d --build
```

### عرض السجلات
```bash
docker-compose logs -f promohive
```

## 🚨 استكشاف الأخطاء

### إذا لم تبدأ الخدمات
```bash
# فحص حالة Docker
systemctl status docker

# إعادة تشغيل Docker
systemctl restart docker

# فحص السجلات
docker-compose logs
```

### إذا فشل الاتصال بقاعدة البيانات
```bash
# فحص متغيرات البيئة
cat .env | grep DATABASE_URL

# اختبار الاتصال
docker-compose exec promohive pnpm prisma db pull
```

### إذا كانت هناك مشاكل في SSL
```bash
# إعادة إنشاء الشهادات
cd /var/www/promohive/ssl
rm cert.pem key.pem
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes \
    -subj '/C=US/ST=State/L=City/O=Organization/CN=int.hostingervps.com'
```

## 📞 الدعم

- **الواتساب:** +1 (725) 334-8692
- **البريد الإلكتروني:** support@promohive.com
- **GitHub:** https://github.com/1sanadsa1997-ui/PromoHive

---

🎉 **بعد اكتمال هذه الخطوات، سيكون التطبيق متاحاً على: https://int.hostingervps.com**
