import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff, Mail, Lock, Globe, Moon, Sun, TrendingUp, DollarSign, Sparkles } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

export default function LoginForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { t, i18n } = useTranslation()
  const { login } = useAuth()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // تحويل البريد الإلكتروني إلى اسم مستخدم للتوافق مع النظام الحالي
      let username = formData.email
      if (formData.email.includes('@')) {
        // استخراج اسم المستخدم من البريد الإلكتروني
        if (formData.email === 'ibrahim@store.com') username = 'ibrahim_store'
        else if (formData.email === 'accountant@store.com') username = 'ahmed_accountant'
        else if (formData.email === 'warehouse@store.com') username = 'mohammed_warehouse'
        else if (formData.email === 'admin@ibrahim-system.com') username = 'system_admin'
        else username = formData.email.split('@')[0]
      }
      
      await login(username, formData.password)
    } catch (err) {
      setError(t('auth.invalidCredentials'))
    } finally {
      setIsLoading(false)
    }
  }

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng)
  }

  const toggleTheme = () => {
    const html = document.documentElement
    const isDark = html.classList.contains('dark')
    
    if (isDark) {
      html.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    } else {
      html.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    }
  }

  const quickLogin = (demoEmail, demoPassword) => {
    setFormData({
      email: demoEmail,
      password: demoPassword
    })
  }

  // Initialize theme
  React.useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add('dark')
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-orange-400/20 to-red-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-400/20 to-orange-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-red-400/10 to-orange-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header Controls */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex space-x-2">
            <button
              onClick={() => changeLanguage('ar')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                i18n.language === 'ar'
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                  : 'bg-white/80 dark:bg-gray-700/80 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600 backdrop-blur-sm'
              }`}
            >
              العربية
            </button>
            <button
              onClick={() => changeLanguage('en')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                i18n.language === 'en'
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                  : 'bg-white/80 dark:bg-gray-700/80 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600 backdrop-blur-sm'
              }`}
            >
              English
            </button>
            <button
              onClick={() => changeLanguage('tr')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                i18n.language === 'tr'
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                  : 'bg-white/80 dark:bg-gray-700/80 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600 backdrop-blur-sm'
              }`}
            >
              Türkçe
            </button>
          </div>
          
          <button
            onClick={toggleTheme}
            className="p-3 rounded-xl bg-white/80 dark:bg-gray-700/80 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600 transition-all duration-300 transform hover:scale-105 backdrop-blur-sm"
          >
            <Moon className="h-5 w-5 dark:hidden" />
            <Sun className="h-5 w-5 hidden dark:block" />
          </button>
        </div>

        {/* Login Card */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 dark:border-gray-700/20">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            {/* Logo */}
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-3xl flex items-center justify-center mb-6 shadow-xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-400/50 to-red-400/50 animate-pulse"></div>
              <img 
                src="https://github.com/1sanadsa1997-ui/PromoHive/blob/codegen-artifacts-store/public/logo-ibrahim.png?raw=true" 
                alt="Ibrahim Logo" 
                className="w-20 h-20 object-contain relative z-10"
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.nextSibling.style.display = 'flex'
                }}
              />
              <div className="hidden items-center space-x-1 relative z-10">
                <DollarSign className="h-8 w-8 text-white" />
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Ibrahim
              </h1>
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
                إبراهيم
              </h2>
              <p className="text-sm font-bold text-gray-600 dark:text-gray-400 tracking-wider">
                ACCOUNTING SYSTEM
              </p>
              <div className="flex items-center justify-center space-x-1 text-orange-500">
                <Sparkles className="h-4 w-4" />
                <span className="text-xs font-medium">نظام المحاسبة المتطور</span>
                <Sparkles className="h-4 w-4" />
              </div>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mt-4">
              {t('auth.signInToAccount') || 'تسجيل الدخول إلى حسابك'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl animate-shake">
              <p className="text-red-600 dark:text-red-400 text-sm text-center font-medium">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                {t('auth.email') || 'البريد الإلكتروني'}
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors duration-300" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-orange-500 dark:focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 dark:bg-gray-700 dark:text-white transition-all duration-300 text-lg"
                  placeholder={t('auth.emailPlaceholder') || 'أدخل بريدك الإلكتروني'}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                {t('auth.password') || 'كلمة المرور'}
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors duration-300" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-12 pr-12 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-orange-500 dark:focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 dark:bg-gray-700 dark:text-white transition-all duration-300 text-lg"
                  placeholder={t('auth.passwordPlaceholder') || 'أدخل كلمة المرور'}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors duration-300"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold text-lg rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400/50 to-red-400/50 animate-pulse"></div>
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2 relative z-10">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{t('common.loading') || 'جاري التحميل...'}</span>
                </div>
              ) : (
                <span className="relative z-10">{t('auth.signIn') || 'تسجيل الدخول'}</span>
              )}
            </button>
          </form>

          {/* Demo Accounts */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4 font-semibold">
              {t('auth.demoAccounts') || 'حسابات تجريبية'}
            </p>
            <div className="space-y-3">
              <button
                onClick={() => quickLogin('ibrahim@store.com', 'Ibrahim123!')}
                className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl border-2 border-blue-200 dark:border-blue-800 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              >
                <p className="font-bold text-blue-900 dark:text-blue-100 text-sm">
                  👨‍💼 {t('auth.storeOwner') || 'مدير المتجر'}: ibrahim@store.com
                </p>
                <p className="text-blue-700 dark:text-blue-300 text-xs">
                  {t('auth.password') || 'كلمة المرور'}: Ibrahim123!
                </p>
              </button>
              <button
                onClick={() => quickLogin('accountant@store.com', 'Ahmed123!')}
                className="w-full bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-xl border-2 border-green-200 dark:border-green-800 hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-900/30 dark:hover:to-emerald-900/30 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              >
                <p className="font-bold text-green-900 dark:text-green-100 text-sm">
                  📊 {t('auth.accountant') || 'المحاسب'}: accountant@store.com
                </p>
                <p className="text-green-700 dark:text-green-300 text-xs">
                  {t('auth.password') || 'كلمة المرور'}: Ahmed123!
                </p>
              </button>
            </div>
          </div>

          {/* Support */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('auth.needHelp') || 'تحتاج مساعدة؟'}{' '}
              <a
                href="https://wa.me/963994054027"
                target="_blank"
                rel="noopener noreferrer"
                className="text-transparent bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text hover:from-orange-700 hover:to-red-700 font-bold transition-all duration-300 hover:scale-105 inline-block"
              >
                {t('auth.contactSupport') || 'تواصل معنا'} 📱
              </a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            © 2024 Ibrahim Accounting System. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}

