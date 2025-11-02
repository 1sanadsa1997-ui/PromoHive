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
        message: 'يجب توفير رمز الوصول'
      })
    }

    // التحقق من صحة الـ token باستخدام Supabase
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
      .select(`
        *,
        store:stores(*)
      `)
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

    // التحقق من صحة الاشتراك
    const subscriptionStatus = await checkSubscriptionStatus(userData.store_id)
    if (!subscriptionStatus.isActive) {
      return res.status(403).json({ 
        error: 'Subscription expired',
        message: 'انتهت صلاحية الاشتراك',
        daysLeft: subscriptionStatus.daysLeft
      })
    }

    // إضافة بيانات المستخدم إلى الطلب
    req.user = {
      ...userData,
      supabaseUser: user,
      subscriptionStatus
    }

    next()
  } catch (error) {
    console.error('Authentication error:', error)
    return res.status(500).json({ 
      error: 'Authentication failed',
      message: 'فشل في التحقق من الهوية'
    })
  }
}

// دالة للتحقق من صحة الاشتراك
const checkSubscriptionStatus = async (storeId) => {
  if (!storeId) return { isActive: false, daysLeft: 0 }
  
  try {
    const { data: store } = await supabaseAdmin
      .from('stores')
      .select('subscription_end_date, subscription_status')
      .eq('id', storeId)
      .single()
    
    if (!store) return { isActive: false, daysLeft: 0 }
    
    const endDate = new Date(store.subscription_end_date)
    const today = new Date()
    const daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24))
    
    return {
      isActive: store.subscription_status === 'active' || 
                (store.subscription_status === 'trial' && daysLeft > 0),
      daysLeft: Math.max(0, daysLeft),
      status: store.subscription_status
    }
  } catch (error) {
    console.error('Subscription check error:', error)
    return { isActive: false, daysLeft: 0 }
  }
}

// Middleware للتحقق من الصلاحيات
export const requirePermission = (requiredPermission) => {
  return (req, res, next) => {
    try {
      const user = req.user
      
      if (!user) {
        return res.status(401).json({ 
          error: 'Authentication required',
          message: 'يجب تسجيل الدخول أولاً'
        })
      }

      // مالك النظام له جميع الصلاحيات
      if (user.role === 'system_owner') {
        return next()
      }

      // مدير المتجر له معظم الصلاحيات
      if (user.role === 'store_manager') {
        return next()
      }

      // التحقق من الصلاحيات المحددة
      const permissions = user.permissions || {}
      
      if (hasPermission(permissions, requiredPermission)) {
        return next()
      }

      return res.status(403).json({ 
        error: 'Insufficient permissions',
        message: 'ليس لديك صلاحية للوصول إلى هذا المورد',
        required: requiredPermission
      })
    } catch (error) {
      console.error('Permission check error:', error)
      return res.status(500).json({ 
        error: 'Permission check failed',
        message: 'فشل في التحقق من الصلاحيات'
      })
    }
  }
}

// دالة للتحقق من وجود صلاحية محددة
const hasPermission = (permissions, requiredPermission) => {
  // إذا كان لدى المستخدم صلاحية "all"
  if (permissions.all === true) {
    return true
  }

  // تحليل الصلاحية المطلوبة (مثل: "invoices.read", "inventory.write")
  const [module, action] = requiredPermission.split('.')
  
  if (!module || !action) {
    return false
  }

  // التحقق من وجود الصلاحية في الوحدة المحددة
  const modulePermissions = permissions[module]
  if (!modulePermissions) {
    return false
  }

  return modulePermissions[action] === true
}

// Middleware للتحقق من الدور
export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      const user = req.user
      
      if (!user) {
        return res.status(401).json({ 
          error: 'Authentication required',
          message: 'يجب تسجيل الدخول أولاً'
        })
      }

      const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]
      
      if (roles.includes(user.role)) {
        return next()
      }

      return res.status(403).json({ 
        error: 'Insufficient role',
        message: 'ليس لديك الدور المطلوب للوصول إلى هذا المورد',
        required: allowedRoles,
        current: user.role
      })
    } catch (error) {
      console.error('Role check error:', error)
      return res.status(500).json({ 
        error: 'Role check failed',
        message: 'فشل في التحقق من الدور'
      })
    }
  }
}

// Middleware للتحقق من ملكية المتجر
export const requireStoreAccess = (req, res, next) => {
  try {
    const user = req.user
    const storeId = req.params.storeId || req.body.store_id || req.query.store_id
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'يجب تسجيل الدخول أولاً'
      })
    }

    // مالك النظام يمكنه الوصول لجميع المتاجر
    if (user.role === 'system_owner') {
      return next()
    }

    // التحقق من أن المستخدم ينتمي لنفس المتجر
    if (storeId && user.store_id !== storeId) {
      return res.status(403).json({ 
        error: 'Store access denied',
        message: 'ليس لديك صلاحية للوصول إلى هذا المتجر'
      })
    }

    next()
  } catch (error) {
    console.error('Store access check error:', error)
    return res.status(500).json({ 
      error: 'Store access check failed',
      message: 'فشل في التحقق من صلاحية الوصول للمتجر'
    })
  }
}

export default {
  authenticateToken,
  requirePermission,
  requireRole,
  requireStoreAccess
}
