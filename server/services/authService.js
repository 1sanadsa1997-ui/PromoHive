import bcrypt from 'bcrypt'
import { supabaseAdmin } from '../config/supabase.js'

class AuthService {
  // تسجيل الدخول
  async login(username, password) {
    try {
      // البحث عن المستخدم
      const { data: user, error } = await supabaseAdmin
        .from('users')
        .select(`
          *,
          stores!inner(
            id,
            name,
            subscription_status,
            subscription_end_date,
            is_active
          )
        `)
        .eq('username', username)
        .eq('is_active', true)
        .single()

      if (error || !user) {
        throw new Error('اسم المستخدم أو كلمة المرور غير صحيحة')
      }

      // التحقق من كلمة المرور
      const isValidPassword = await bcrypt.compare(password, user.password_hash)
      if (!isValidPassword) {
        throw new Error('اسم المستخدم أو كلمة المرور غير صحيحة')
      }

      // التحقق من حالة المتجر
      if (!user.stores.is_active) {
        throw new Error('المتجر معطل')
      }

      // التحقق من صحة الاشتراك
      const now = new Date()
      const endDate = new Date(user.stores.subscription_end_date)
      const isSubscriptionActive = (
        user.stores.subscription_status === 'active' || 
        user.stores.subscription_status === 'trial'
      ) && endDate > now

      if (!isSubscriptionActive) {
        throw new Error('انتهت صلاحية الاشتراك')
      }

      // تحديث آخر تسجيل دخول
      await supabaseAdmin
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', user.id)

      // إنشاء جلسة Supabase
      const { data: session, error: sessionError } = await supabaseAdmin.auth.signInWithPassword({
        email: user.email,
        password: password
      })

      if (sessionError) {
        throw new Error('خطأ في إنشاء الجلسة')
      }

      // إرجاع بيانات المستخدم والجلسة
      return {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
          permissions: user.permissions,
          locale: user.locale,
          theme: user.theme,
          store_id: user.store_id,
          store: {
            id: user.stores.id,
            name: user.stores.name,
            subscription_status: user.stores.subscription_status,
            subscription_end_date: user.stores.subscription_end_date
          }
        },
        session: session.session,
        access_token: session.session.access_token,
        refresh_token: session.session.refresh_token
      }
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  // تسجيل الخروج
  async logout(accessToken) {
    try {
      const { error } = await supabaseAdmin.auth.signOut(accessToken)
      if (error) {
        throw new Error('خطأ في تسجيل الخروج')
      }
      return { success: true }
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  }

  // تجديد الرمز المميز
  async refreshToken(refreshToken) {
    try {
      const { data: session, error } = await supabaseAdmin.auth.refreshSession({
        refresh_token: refreshToken
      })

      if (error || !session) {
        throw new Error('رمز التجديد غير صحيح')
      }

      return {
        access_token: session.session.access_token,
        refresh_token: session.session.refresh_token,
        expires_at: session.session.expires_at
      }
    } catch (error) {
      console.error('Refresh token error:', error)
      throw error
    }
  }

  // إنشاء مستخدم جديد (بواسطة مدير المتجر أو مالك النظام)
  async createUser(userData, createdBy) {
    try {
      // التحقق من صلاحية المنشئ
      const { data: creator, error: creatorError } = await supabaseAdmin
        .from('users')
        .select('role, store_id')
        .eq('id', createdBy)
        .single()

      if (creatorError || !creator) {
        throw new Error('المستخدم المنشئ غير موجود')
      }

      // التحقق من الصلاحيات
      if (creator.role !== 'system_owner' && creator.role !== 'store_manager') {
        throw new Error('ليس لديك صلاحية إنشاء مستخدمين')
      }

      // تشفير كلمة المرور
      const saltRounds = 12
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds)

      // تحديد store_id
      let storeId = userData.store_id
      if (creator.role === 'store_manager') {
        storeId = creator.store_id // مدير المتجر يمكنه إنشاء مستخدمين في متجره فقط
      }

      // إنشاء المستخدم
      const { data: newUser, error } = await supabaseAdmin
        .from('users')
        .insert({
          store_id: storeId,
          email: userData.email,
          username: userData.username,
          password_hash: hashedPassword,
          full_name: userData.full_name,
          role: userData.role,
          permissions: userData.permissions || {},
          phone: userData.phone,
          locale: userData.locale || 'ar',
          theme: userData.theme || 'light',
          created_by: createdBy
        })
        .select()
        .single()

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          throw new Error('اسم المستخدم أو البريد الإلكتروني مستخدم بالفعل')
        }
        throw new Error('خطأ في إنشاء المستخدم')
      }

      return {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        full_name: newUser.full_name,
        role: newUser.role,
        permissions: newUser.permissions,
        is_active: newUser.is_active,
        created_at: newUser.created_at
      }
    } catch (error) {
      console.error('Create user error:', error)
      throw error
    }
  }

  // تحديث كلمة المرور
  async changePassword(userId, currentPassword, newPassword) {
    try {
      // الحصول على المستخدم
      const { data: user, error } = await supabaseAdmin
        .from('users')
        .select('password_hash')
        .eq('id', userId)
        .single()

      if (error || !user) {
        throw new Error('المستخدم غير موجود')
      }

      // التحقق من كلمة المرور الحالية
      const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash)
      if (!isValidPassword) {
        throw new Error('كلمة المرور الحالية غير صحيحة')
      }

      // تشفير كلمة المرور الجديدة
      const saltRounds = 12
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds)

      // تحديث كلمة المرور
      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({ 
          password_hash: hashedNewPassword,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (updateError) {
        throw new Error('خطأ في تحديث كلمة المرور')
      }

      return { success: true }
    } catch (error) {
      console.error('Change password error:', error)
      throw error
    }
  }

  // تحديث ملف المستخدم
  async updateProfile(userId, profileData) {
    try {
      const allowedFields = ['full_name', 'phone', 'locale', 'theme']
      const updateData = {}
      
      // تصفية الحقول المسموحة فقط
      for (const field of allowedFields) {
        if (profileData[field] !== undefined) {
          updateData[field] = profileData[field]
        }
      }

      updateData.updated_at = new Date().toISOString()

      const { data: updatedUser, error } = await supabaseAdmin
        .from('users')
        .update(updateData)
        .eq('id', userId)
        .select('id, full_name, phone, locale, theme, updated_at')
        .single()

      if (error) {
        throw new Error('خطأ في تحديث الملف الشخصي')
      }

      return updatedUser
    } catch (error) {
      console.error('Update profile error:', error)
      throw error
    }
  }

  // الحصول على معلومات المستخدم
  async getUserInfo(userId) {
    try {
      const { data: user, error } = await supabaseAdmin
        .from('users')
        .select(`
          id,
          username,
          email,
          full_name,
          role,
          permissions,
          phone,
          is_active,
          locale,
          theme,
          last_login,
          created_at,
          stores!inner(
            id,
            name,
            subscription_status,
            subscription_end_date
          )
        `)
        .eq('id', userId)
        .single()

      if (error || !user) {
        throw new Error('المستخدم غير موجود')
      }

      return {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
          permissions: user.permissions,
          phone: user.phone,
          is_active: user.is_active,
          locale: user.locale,
          theme: user.theme,
          last_login: user.last_login,
          created_at: user.created_at
        },
        store: user.stores
      }
    } catch (error) {
      console.error('Get user info error:', error)
      throw error
    }
  }
}

export default new AuthService()
