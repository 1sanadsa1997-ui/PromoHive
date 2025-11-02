import jwt from 'jsonwebtoken'
import { supabaseAdmin } from '../config/supabase.js'

// Middleware للتحقق من صحة JWT token
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        error: 'Access token required',
        message: 'يجب تسجيل الدخول للوصول لهذا المورد'
      })
    }

    // التحقق من صحة Token باستخدام Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
    
    if (error || !user) {
      return res.status(401).json({ 
        error: 'Invalid token',
        message: 'رمز الوصول غير صحيح'
      })
    }

    // الحصول على بيانات المستخدم من قاعدة البيانات
    const { data: userData, error: userError } = await supabaseAdmin
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

    // التحقق من حالة المستخدم
    if (!userData.is_active) {
      return res.status(403).json({ 
        error: 'Account disabled',
        message: 'الحساب معطل'
      })
    }

    // إضافة بيانات المستخدم إلى الطلب
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

// Middleware للتحقق من صحة الاشتراك
export const checkSubscription = async (req, res, next) => {
  try {
    if (!req.storeId) {
      return res.status(403).json({ 
        error: 'Store not found',
        message: 'المتجر غير موجود'
      })
    }

    // الحصول على بيانات المتجر والاشتراك
    const { data: store, error } = await supabaseAdmin
      .from('stores')
      .select('subscription_status, subscription_end_date')
      .eq('id', req.storeId)
      .single()

    if (error || !store) {
      return res.status(403).json({ 
        error: 'Store not found',
        message: 'المتجر غير موجود'
      })
    }

    // التحقق من صحة الاشتراك
    const now = new Date()
    const endDate = new Date(store.subscription_end_date)
    const isActive = (store.subscription_status === 'active' || store.subscription_status === 'trial') && endDate > now

    if (!isActive) {
      return res.status(402).json({ 
        error: 'Subscription expired',
        message: 'انتهت صلاحية الاشتراك',
        subscription_status: store.subscription_status,
        subscription_end_date: store.subscription_end_date
      })
    }

    // إضافة معلومات الاشتراك إلى الطلب
    req.subscription = {
      status: store.subscription_status,
      endDate: store.subscription_end_date,
      daysLeft: Math.ceil((endDate - now) / (1000 * 60 * 60 * 24))
    }

    next()
  } catch (error) {
    console.error('Subscription check error:', error)
    return res.status(500).json({ 
      error: 'Subscription check failed',
      message: 'خطأ في التحقق من الاشتراك'
    })
  }
}

// Middleware للتحقق من الصلاحيات
export const checkPermission = (requiredRole, requiredPermission = null) => {
  return (req, res, next) => {
    try {
      const userRole = req.user.role
      const userPermissions = req.user.permissions || {}

      // مالك النظام له صلاحية كاملة
      if (userRole === 'system_owner') {
        return next()
      }

      // مدير المتجر له صلاحية كاملة في متجره
      if (userRole === 'store_manager' && req.user.store_id === req.storeId) {
        return next()
      }

      // التحقق من الدور المطلوب
      if (requiredRole && userRole !== requiredRole) {
        return res.status(403).json({ 
          error: 'Insufficient role',
          message: 'ليس لديك الدور المطلوب للوصول لهذا المورد'
        })
      }

      // التحقق من الصلاحية المحددة
      if (requiredPermission) {
        const [module, action] = requiredPermission.split('.')
        const hasPermission = userPermissions[module] && userPermissions[module][action]

        if (!hasPermission) {
          return res.status(403).json({ 
            error: 'Insufficient permission',
            message: 'ليس لديك الصلاحية المطلوبة لهذا الإجراء'
          })
        }
      }

      next()
    } catch (error) {
      console.error('Permission check error:', error)
      return res.status(500).json({ 
        error: 'Permission check failed',
        message: 'خطأ في التحقق من الصلاحيات'
      })
    }
  }
}

// Middleware لتسجيل العمليات (Audit Log)
export const auditLog = (action, entityType) => {
  return async (req, res, next) => {
    // حفظ البيانات الأصلية للمقارنة
    req.auditData = {
      action,
      entityType,
      userId: req.userId,
      storeId: req.storeId,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date()
    }

    // تنفيذ العملية
    const originalSend = res.send
    res.send = function(data) {
      // تسجيل العملية بعد نجاحها
      if (res.statusCode >= 200 && res.statusCode < 300) {
        logAuditEntry(req.auditData, req.body, data)
      }
      originalSend.call(this, data)
    }

    next()
  }
}

// دالة مساعدة لتسجيل العمليات
const logAuditEntry = async (auditData, requestData, responseData) => {
  try {
    await supabaseAdmin
      .from('audit_logs')
      .insert({
        store_id: auditData.storeId,
        user_id: auditData.userId,
        action: auditData.action,
        entity_type: auditData.entityType,
        new_data: requestData,
        ip_address: auditData.ipAddress,
        user_agent: auditData.userAgent
      })
  } catch (error) {
    console.error('Audit log error:', error)
  }
}

export default {
  authenticateToken,
  checkSubscription,
  checkPermission,
  auditLog
}
