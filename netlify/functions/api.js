import express from 'express'
import serverless from 'serverless-http'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

// إنشاء تطبيق Express
const app = express()

// إعداد Supabase
const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://fonts.googleapis.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://*.supabase.co", "wss://*.supabase.co", "https://api.whatsapp.com"]
    }
  }
}))

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://ibrahim-accounting-system-2024.netlify.app', 'https://*.netlify.app']
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests',
    message: 'تم تجاوز الحد المسموح من الطلبات. يرجى المحاولة لاحقاً.'
  }
})

app.use('/api/', limiter)

// Middleware للتحقق من المصادقة
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({ 
        error: 'Access token required',
        message: 'يجب تسجيل الدخول للوصول لهذا المورد'
      })
    }

    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      return res.status(401).json({ 
        error: 'Invalid token',
        message: 'رمز الوصول غير صحيح'
      })
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return res.status(401).json({ 
        error: 'User not found',
        message: 'المستخدم غير موجود'
      })
    }

    if (!userData.is_active) {
      return res.status(403).json({ 
        error: 'Account disabled',
        message: 'الحساب معطل'
      })
    }

    req.user = userData
    req.userId = user.id
    req.storeId = userData.store_id

    next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    return res.status(500).json({ 
      error: 'Authentication error',
      message: 'خطأ في المصادقة'
    })
  }
}

// Routes

// تسجيل الدخول
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({
        error: 'Missing credentials',
        message: 'يرجى إدخال اسم المستخدم وكلمة المرور'
      })
    }

    // البحث عن المستخدم
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*, stores(*)')
      .or(`username.eq.${username},email.eq.${username}`)
      .single()

    if (userError || !user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'اسم المستخدم أو كلمة المرور غير صحيحة'
      })
    }

    // التحقق من كلمة المرور
    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'اسم المستخدم أو كلمة المرور غير صحيحة'
      })
    }

    // التحقق من حالة المستخدم
    if (!user.is_active) {
      return res.status(403).json({
        error: 'Account disabled',
        message: 'الحساب معطل'
      })
    }

    // التحقق من صحة الاشتراك
    const store = user.stores
    const now = new Date()
    const endDate = new Date(store.subscription_end_date)
    const isSubscriptionActive = (store.subscription_status === 'active' || store.subscription_status === 'trial') && endDate > now

    if (!isSubscriptionActive) {
      return res.status(402).json({
        error: 'Subscription expired',
        message: 'انتهت صلاحية الاشتراك',
        subscription_status: store.subscription_status,
        subscription_end_date: store.subscription_end_date
      })
    }

    // إنشاء JWT token
    const token = jwt.sign(
      { 
        sub: user.id,
        email: user.email,
        role: user.role,
        store_id: user.store_id
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    )

    // تحديث آخر تسجيل دخول
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id)

    // إرسال الاستجابة
    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          full_name: user.full_name,
          role: user.role,
          permissions: user.permissions,
          locale: user.locale,
          theme: user.theme,
          store_id: user.store_id,
          store: {
            id: store.id,
            name: store.name,
            subscription_status: store.subscription_status,
            subscription_plan: store.subscription_plan,
            subscription_end_date: store.subscription_end_date,
            default_currency: store.default_currency
          }
        }
      }
    })

  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: 'خطأ في الخادم'
    })
  }
})

// الحصول على الملف الشخصي
app.get('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('*')
      .eq('id', req.storeId)
      .single()

    if (storeError) {
      return res.status(404).json({
        error: 'Store not found',
        message: 'المتجر غير موجود'
      })
    }

    res.json({
      success: true,
      data: {
        user: {
          id: req.user.id,
          email: req.user.email,
          username: req.user.username,
          full_name: req.user.full_name,
          role: req.user.role,
          permissions: req.user.permissions,
          locale: req.user.locale,
          theme: req.user.theme,
          store_id: req.user.store_id,
          store: store
        }
      }
    })
  } catch (error) {
    console.error('Profile error:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: 'خطأ في الخادم'
    })
  }
})

// خطط الاشتراك
app.get('/api/subscription/plans', (req, res) => {
  const plans = {
    monthly: {
      name: 'الخطة الشهرية',
      price: 5,
      duration: 30,
      features: [
        'جميع ميزات النظام',
        'دعم فني عبر WhatsApp',
        'تحديثات مجانية',
        'نسخ احتياطي يومي',
        'دعم العملات المتعددة',
        'تقارير شاملة'
      ]
    },
    semi_annual: {
      name: 'الخطة نصف السنوية',
      price: 30,
      duration: 180,
      features: [
        'جميع ميزات الخطة الشهرية',
        'وفر 50% مقارنة بالخطة الشهرية',
        'دعم فني مميز',
        'تدريب مجاني على النظام',
        'تخصيص إضافي للتقارير',
        'أولوية في الدعم الفني'
      ]
    },
    annual: {
      name: 'الخطة السنوية',
      price: 40,
      duration: 365,
      features: [
        'جميع ميزات الخطة نصف السنوية',
        'وفر 67% مقارنة بالخطة الشهرية',
        'دعم فني مخصص',
        'تدريب شامل للفريق',
        'تقارير مخصصة حسب الطلب',
        'استشارة مجانية شهرية',
        'تكامل مع أنظمة خارجية'
      ]
    }
  }

  res.json({
    success: true,
    data: plans
  })
})

// حالة الاشتراك
app.get('/api/subscription/status', authenticateToken, async (req, res) => {
  try {
    const { data: store, error } = await supabase
      .from('stores')
      .select('subscription_status, subscription_plan, subscription_start_date, subscription_end_date')
      .eq('id', req.storeId)
      .single()

    if (error) {
      return res.status(404).json({
        error: 'Store not found',
        message: 'المتجر غير موجود'
      })
    }

    const now = new Date()
    const endDate = new Date(store.subscription_end_date)
    const daysLeft = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24))
    const isActive = (store.subscription_status === 'active' || store.subscription_status === 'trial') && endDate > now

    res.json({
      success: true,
      data: {
        status: store.subscription_status,
        plan: store.subscription_plan,
        start_date: store.subscription_start_date,
        end_date: store.subscription_end_date,
        days_left: Math.max(0, daysLeft),
        is_active: isActive,
        is_trial: store.subscription_status === 'trial'
      }
    })
  } catch (error) {
    console.error('Subscription status error:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: 'خطأ في الخادم'
    })
  }
})

// رابط ترقية WhatsApp
app.post('/api/subscription/whatsapp-upgrade', authenticateToken, async (req, res) => {
  try {
    const { plan } = req.body

    if (!plan || !['monthly', 'semi_annual', 'annual'].includes(plan)) {
      return res.status(400).json({
        error: 'Invalid plan',
        message: 'خطة غير صحيحة'
      })
    }

    const { data: store, error } = await supabase
      .from('stores')
      .select('name')
      .eq('id', req.storeId)
      .single()

    if (error) {
      return res.status(404).json({
        error: 'Store not found',
        message: 'المتجر غير موجود'
      })
    }

    const plans = {
      monthly: { name: 'الشهرية', price: '$5', duration: '30 يوم' },
      semi_annual: { name: 'نصف السنوية', price: '$30', duration: '6 أشهر' },
      annual: { name: 'السنوية', price: '$40', duration: 'سنة كاملة' }
    }

    const selectedPlan = plans[plan]
    const phoneNumber = process.env.WHATSAPP_PHONE_NUMBER || '+963994054027'
    
    const message = `مرحباً، أريد ترقية اشتراك متجر "${store.name}" إلى الخطة ${selectedPlan.name}

📋 تفاصيل الطلب:
• اسم المتجر: ${store.name}
• الخطة المطلوبة: ${selectedPlan.name}
• السعر: ${selectedPlan.price}
• المدة: ${selectedPlan.duration}
• معرف المتجر: ${req.storeId}

يرجى إرسال تفاصيل الدفع وتأكيد الترقية.

شكراً لكم 🙏`

    const whatsappLink = `https://wa.me/${phoneNumber.replace('+', '')}?text=${encodeURIComponent(message)}`

    res.json({
      success: true,
      data: {
        whatsapp_link: whatsappLink,
        message: message,
        phone_number: phoneNumber
      }
    })
  } catch (error) {
    console.error('WhatsApp upgrade error:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: 'خطأ في الخادم'
    })
  }
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'نظام إبراهيم للمحاسبة يعمل بشكل طبيعي',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  })
})

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error)
  res.status(500).json({
    error: 'Internal server error',
    message: 'خطأ في الخادم'
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: 'المورد المطلوب غير موجود'
  })
})

// تصدير التطبيق كـ Netlify Function
export const handler = serverless(app)
