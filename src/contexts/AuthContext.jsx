import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { supabase } from '../lib/supabase'

// Initial state
const initialState = {
  user: null,
  session: null,
  loading: true,
  error: null,
  subscription: null
}

// Action types
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_USER: 'SET_USER',
  SET_SESSION: 'SET_SESSION',
  SET_ERROR: 'SET_ERROR',
  SET_SUBSCRIPTION: 'SET_SUBSCRIPTION',
  LOGOUT: 'LOGOUT'
}

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload }
    case AUTH_ACTIONS.SET_USER:
      return { ...state, user: action.payload, loading: false, error: null }
    case AUTH_ACTIONS.SET_SESSION:
      return { ...state, session: action.payload }
    case AUTH_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false }
    case AUTH_ACTIONS.SET_SUBSCRIPTION:
      return { ...state, subscription: action.payload }
    case AUTH_ACTIONS.LOGOUT:
      return { ...initialState, loading: false }
    default:
      return state
  }
}

// Create context
const AuthContext = createContext()

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // تسجيل الدخول
  const login = async (username, password) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true })
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: null })

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'خطأ في تسجيل الدخول')
      }

      // حفظ الرموز المميزة
      localStorage.setItem('access_token', data.data.access_token)
      localStorage.setItem('refresh_token', data.data.refresh_token)

      // تحديث الحالة
      dispatch({ type: AUTH_ACTIONS.SET_USER, payload: data.data.user })
      dispatch({ type: AUTH_ACTIONS.SET_SESSION, payload: data.data.session })

      // جلب معلومات الاشتراك
      await fetchSubscriptionInfo()

      return data.data
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: error.message })
      throw error
    }
  }

  // تسجيل الخروج
  const logout = async () => {
    try {
      const token = localStorage.getItem('access_token')
      
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      }

      // مسح البيانات المحلية
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')

      // تحديث الحالة
      dispatch({ type: AUTH_ACTIONS.LOGOUT })
    } catch (error) {
      console.error('Logout error:', error)
      // حتى لو فشل تسجيل الخروج من الخادم، نقوم بمسح البيانات المحلية
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      dispatch({ type: AUTH_ACTIONS.LOGOUT })
    }
  }

  // تجديد الرمز المميز
  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token')
      if (!refreshToken) {
        throw new Error('لا يوجد رمز تجديد')
      }

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refresh_token: refreshToken })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'فشل في تجديد الرمز المميز')
      }

      // حفظ الرموز الجديدة
      localStorage.setItem('access_token', data.data.access_token)
      localStorage.setItem('refresh_token', data.data.refresh_token)

      return data.data.access_token
    } catch (error) {
      console.error('Token refresh error:', error)
      // إذا فشل التجديد، نقوم بتسجيل الخروج
      await logout()
      throw error
    }
  }

  // جلب معلومات المستخدم
  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem('access_token')
      if (!token) return null

      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.status === 401) {
        // محاولة تجديد الرمز المميز
        try {
          const newToken = await refreshToken()
          const retryResponse = await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${newToken}`
            }
          })
          
          if (retryResponse.ok) {
            const retryData = await retryResponse.json()
            dispatch({ type: AUTH_ACTIONS.SET_USER, payload: retryData.data.user })
            return retryData.data
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError)
        }
        
        await logout()
        return null
      }

      if (!response.ok) {
        throw new Error('فشل في جلب معلومات المستخدم')
      }

      const data = await response.json()
      dispatch({ type: AUTH_ACTIONS.SET_USER, payload: data.data.user })
      return data.data
    } catch (error) {
      console.error('Fetch user info error:', error)
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: error.message })
      return null
    }
  }

  // جلب معلومات الاشتراك
  const fetchSubscriptionInfo = async () => {
    try {
      const token = localStorage.getItem('access_token')
      if (!token) return null

      const response = await fetch('/api/subscription/info', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        dispatch({ type: AUTH_ACTIONS.SET_SUBSCRIPTION, payload: data.data })
        return data.data
      }
    } catch (error) {
      console.error('Fetch subscription info error:', error)
    }
    return null
  }

  // تحديث الملف الشخصي
  const updateProfile = async (profileData) => {
    try {
      const token = localStorage.getItem('access_token')
      if (!token) throw new Error('غير مسجل الدخول')

      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'فشل في تحديث الملف الشخصي')
      }

      // تحديث بيانات المستخدم في الحالة
      dispatch({ 
        type: AUTH_ACTIONS.SET_USER, 
        payload: { ...state.user, ...data.data } 
      })

      return data.data
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: error.message })
      throw error
    }
  }

  // تغيير كلمة المرور
  const changePassword = async (currentPassword, newPassword, confirmPassword) => {
    try {
      const token = localStorage.getItem('access_token')
      if (!token) throw new Error('غير مسجل الدخول')

      const response = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
          confirm_password: confirmPassword
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'فشل في تغيير كلمة المرور')
      }

      return data
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: error.message })
      throw error
    }
  }

  // التحقق من الجلسة عند تحميل التطبيق
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true })
        
        const token = localStorage.getItem('access_token')
        if (!token) {
          dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false })
          return
        }

        // جلب معلومات المستخدم
        const userInfo = await fetchUserInfo()
        if (userInfo) {
          // جلب معلومات الاشتراك
          await fetchSubscriptionInfo()
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: error.message })
      } finally {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false })
      }
    }

    initializeAuth()
  }, [])

  // قيم السياق
  const value = {
    ...state,
    login,
    logout,
    refreshToken,
    fetchUserInfo,
    fetchSubscriptionInfo,
    updateProfile,
    changePassword
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook لاستخدام السياق
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
