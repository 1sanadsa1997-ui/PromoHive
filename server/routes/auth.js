import express from 'express'
import bcrypt from 'bcrypt'
import { supabaseAdmin } from '../config/supabase.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

// تسجيل الدخول
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({
        error: 'Missing credentials',
        message: 'يجب توفير اسم المستخدم وكلمة المرور'
      })
    }

    // البحث عن المستخدم
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select(`
        *,
        store:stores(*)
      `)
      .or(`username.eq.${username},email.eq.${username}`)
      .eq('is_active', true)
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

    // التحقق من صحة الاشتراك
    const subscriptionStatus = await checkSubscriptionStatus(user.store_id)
    if (!subscriptionStatus.isActive) {
      return res.status(403).json({
        error: 'Subscription expired',
        message: 'انتهت صلاحية الاشتراك',
        daysLeft: subscriptionStatus.daysLeft,
        subscriptionStatus
      })
    }

    // إنشاء جلسة Supabase
    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email: user.email,
      password: password
    })

    if (authError) {
      // إذا لم يكن المستخدم موجود في Supabase Auth، قم بإنشائه
      const { data: newAuthData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: user.email,
        password: password,
        user_metadata: {
          username: user.username,
          full_name: user.full_name,
          store_id: user.store_id,
          role: user.role
        }
      })

      if (createError) {
        console.error('Auth creation error:', createError)
        return res.status(500).json({
          error: 'Authentication failed',
          message: 'فشل في إنشاء جلسة المصادقة'
        })
      }

      authData = newAuthData
    }

    // تحديث آخر تسجيل دخول
    await supabaseAdmin
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id)

    // إرجاع بيانات المستخدم والـ token
    const { password_hash, ...userWithoutPassword } = user
    
    res.json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح',
      user: userWithoutPassword,
      token: authData.session?.access_token,
      refresh_token: authData.session?.refresh_token,
      subscriptionStatus
    })

  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      error: 'Login failed',
      message: 'فشل في تسجيل الدخول'
    })
  }
})

// تسجيل الخروج
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.auth.signOut()
    
    if (error) {
      console.error('Logout error:', error)
    }

    res.json({
      success: true,
      message: 'تم تسجيل الخروج بنجاح'
    })
  } catch (error) {
    console.error('Logout error:', error)
    res.status(500).json({
      error: 'Logout failed',
      message: 'فشل في تسجيل الخروج'
    })
  }
})

// تحديث الـ token
router.post('/refresh', async (req, res) => {
  try {
    const { refresh_token } = req.body

    if (!refresh_token) {
      return res.status(400).json({
        error: 'Refresh token required',
        message: 'يجب توفير رمز التحديث'
      })
    }

    const { data, error } = await supabaseAdmin.auth.refreshSession({
      refresh_token
    })

    if (error) {
      return res.status(401).json({
        error: 'Invalid refresh token',
        message: 'رمز التحديث غير صحيح'
      })
    }

    res.json({
      success: true,
      token: data.session?.access_token,
      refresh_token: data.session?.refresh_token
    })

  } catch (error) {
    console.error('Token refresh error:', error)
    res.status(500).json({
      error: 'Token refresh failed',
      message: 'فشل في تحديث الرمز'
    })
  }
})

// الحصول على بيانات المستخدم الحالي
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const { password_hash, ...userWithoutPassword } = req.user
    
    res.json({
      success: true,
      user: userWithoutPassword,
      subscriptionStatus: req.user.subscriptionStatus
    })
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({
      error: 'Failed to get user data',
      message: 'فشل في الحصول على بيانات المستخدم'
    })
  }
})

// تغيير كلمة المرور
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    const userId = req.user.id

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: 'Missing passwords',
        message: 'يجب توفير كلمة المرور الحالية والجديدة'
      })
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        error: 'Password too short',
        message: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'
      })
    }

    // التحقق من كلمة المرور الحالية
    const isValidPassword = await bcrypt.compare(currentPassword, req.user.password_hash)
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid current password',
        message: 'كلمة المرور الحالية غير صحيحة'
      })
    }

    // تشفير كلمة المرور الجديدة
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds)

    // تحديث كلمة المرور في قاعدة البيانات
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ 
        password_hash: hashedPassword,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (updateError) {
      throw updateError
    }

    // تحديث كلمة المرور في Supabase Auth
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      req.user.supabaseUser.id,
      { password: newPassword }
    )

    if (authError) {
      console.error('Auth password update error:', authError)
    }

    res.json({
      success: true,
      message: 'تم تغيير كلمة المرور بنجاح'
    })

  } catch (error) {
    console.error('Change password error:', error)
    res.status(500).json({
      error: 'Password change failed',
      message: 'فشل في تغيير كلمة المرور'
    })
  }
})

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

export default router
