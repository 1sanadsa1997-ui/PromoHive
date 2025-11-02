import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../../src/lib/supabase'
import { User, Session } from '@supabase/supabase-js'

interface AuthUser {
  id: string
  email: string
  username: string
  full_name: string
  role: string
  store_id: string
  permissions: Record<string, any>
  is_active: boolean
  locale: string
  theme: string
  store?: {
    id: string
    name: string
    subscription_status: string
    subscription_end_date: string
  }
}

interface SubscriptionStatus {
  isActive: boolean
  daysLeft: number
  status: string
}

interface AuthContextType {
  user: AuthUser | null
  session: Session | null
  subscriptionStatus: SubscriptionStatus | null
  loading: boolean
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  hasPermission: (permission: string) => boolean
  hasRole: (role: string | string[]) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null)
  const [loading, setLoading] = useState(true)

  // تحديث بيانات المستخدم
  const refreshUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        // الحصول على بيانات المستخدم من قاعدة البيانات
        const { data: userData, error } = await supabase
          .from('users')
          .select(`
            *,
            store:stores(*)
          `)
          .eq('id', session.user.id)
          .single()

        if (error) {
          console.error('Error fetching user data:', error)
          setUser(null)
          setSession(null)
          setSubscriptionStatus(null)
          return
        }

        // التحقق من صحة الاشتراك
        const subStatus = await checkSubscriptionStatus(userData.store_id)
        
        setUser(userData)
        setSession(session)
        setSubscriptionStatus(subStatus)
      } else {
        setUser(null)
        setSession(null)
        setSubscriptionStatus(null)
      }
    } catch (error) {
      console.error('Error refreshing user:', error)
      setUser(null)
      setSession(null)
      setSubscriptionStatus(null)
    }
  }

  // تسجيل الدخول
  const login = async (username: string, password: string) => {
    try {
      setLoading(true)
      
      // استدعاء API الخاص بنا للتسجيل
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, error: data.message || data.error }
      }

      // تعيين الجلسة في Supabase
      if (data.token) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: data.token,
          refresh_token: data.refresh_token
        })

        if (sessionError) {
          console.error('Session error:', sessionError)
          return { success: false, error: 'فشل في إنشاء الجلسة' }
        }
      }

      // تحديث بيانات المستخدم
      setUser(data.user)
      setSubscriptionStatus(data.subscriptionStatus)
      
      return { success: true }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'فشل في تسجيل الدخول' }
    } finally {
      setLoading(false)
    }
  }

  // تسجيل الخروج
  const logout = async () => {
    try {
      setLoading(true)
      
      // استدعاء API الخاص بنا للخروج
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
        },
      })

      // تسجيل الخروج من Supabase
      await supabase.auth.signOut()
      
      setUser(null)
      setSession(null)
      setSubscriptionStatus(null)
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setLoading(false)
    }
  }

  // التحقق من الصلاحيات
  const hasPermission = (permission: string): boolean => {
    if (!user) return false
    
    // مالك النظام له جميع الصلاحيات
    if (user.role === 'system_owner') return true
    
    // مدير المتجر له معظم الصلاحيات
    if (user.role === 'store_manager') return true
    
    const permissions = user.permissions || {}
    
    // إذا كان لدى المستخدم صلاحية "all"
    if (permissions.all === true) return true
    
    // تحليل الصلاحية المطلوبة (مثل: "invoices.read")
    const [module, action] = permission.split('.')
    if (!module || !action) return false
    
    const modulePermissions = permissions[module]
    if (!modulePermissions) return false
    
    return modulePermissions[action] === true
  }

  // التحقق من الدور
  const hasRole = (role: string | string[]): boolean => {
    if (!user) return false
    
    const roles = Array.isArray(role) ? role : [role]
    return roles.includes(user.role)
  }

  // التحقق من صحة الاشتراك
  const checkSubscriptionStatus = async (storeId: string): Promise<SubscriptionStatus> => {
    if (!storeId) return { isActive: false, daysLeft: 0, status: 'expired' }
    
    try {
      const { data: store } = await supabase
        .from('stores')
        .select('subscription_end_date, subscription_status')
        .eq('id', storeId)
        .single()
      
      if (!store) return { isActive: false, daysLeft: 0, status: 'expired' }
      
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
      return { isActive: false, daysLeft: 0, status: 'expired' }
    }
  }

  // تهيئة المصادقة عند تحميل التطبيق
  useEffect(() => {
    const initAuth = async () => {
      try {
        await refreshUser()
      } catch (error) {
        console.error('Auth initialization error:', error)
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    // الاستماع لتغييرات المصادقة
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          await refreshUser()
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setSession(null)
          setSubscriptionStatus(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const value: AuthContextType = {
    user,
    session,
    subscriptionStatus,
    loading,
    login,
    logout,
    refreshUser,
    hasPermission,
    hasRole,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
