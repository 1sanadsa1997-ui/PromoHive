import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff, Mail, Lock, Globe, Moon, Sun, TrendingUp, DollarSign, Sparkles, LogIn, Shield, Star } from 'lucide-react'
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
      setError(t('auth.invalidCredentials') || 'بيانات الدخول غير صحيحة')
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
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-orange-400/30 to-red-400/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-400/30 to-orange-400/30 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-red-400/20 to-orange-400/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '0.5s'}}></div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-20 w-4 h-4 bg-orange-400 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
        <div className="absolute top-40 right-32 w-3 h-3 bg-red-400 rounded-full animate-bounce" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute bottom-32 left-40 w-5 h-5 bg-pink-400 rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 right-20 w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{animationDelay: '1.5s'}}></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header Controls */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex space-x-2 rtl:space-x-reverse">
            <button
              onClick={() => changeLanguage('ar')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 transform hover:scale-110 hover:rotate-1 ${
                i18n.language === 'ar'
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/25'
                  : 'bg-white/90 dark:bg-gray-700/90 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600 backdrop-blur-sm border border-orange-200 dark:border-gray-600'
              }`}
            >
              العربية
            </button>
            <button
              onClick={() => changeLanguage('en')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 transform hover:scale-110 hover:rotate-1 ${
                i18n.language === 'en'
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/25'
                  : 'bg-white/90 dark:bg-gray-700/90 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600 backdrop-blur-sm border border-orange-200 dark:border-gray-600'
              }`}
            >
              English
            </button>
            <button
              onClick={() => changeLanguage('tr')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 transform hover:scale-110 hover:rotate-1 ${
                i18n.language === 'tr'
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/25'
                  : 'bg-white/90 dark:bg-gray-700/90 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600 backdrop-blur-sm border border-orange-200 dark:border-gray-600'
              }`}
            >
              Türkçe
            </button>
          </div>
          
          <button
            onClick={toggleTheme}
            className="p-3 rounded-xl bg-white/90 dark:bg-gray-700/90 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600 transition-all duration-300 transform hover:scale-110 hover:rotate-12 backdrop-blur-sm border border-orange-200 dark:border-gray-600 shadow-lg"
          >
            <Moon className="h-5 w-5 dark:hidden" />
            <Sun className="h-5 w-5 hidden dark:block" />
          </button>
        </div>

        {/* Login Card */}
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/30 dark:border-gray-700/30 relative overflow-hidden">
          {/* Card Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-red-500/5 to-pink-500/5 rounded-3xl"></div>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500"></div>
          
          {/* Logo and Title */}
          <div className="text-center mb-8 relative z-10">
            {/* Logo */}
            <div className="mx-auto w-28 h-28 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-3xl flex items-center justify-center mb-6 shadow-2xl transform hover:scale-110 hover:rotate-3 transition-all duration-500 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-400/50 to-red-400/50 animate-pulse"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <img 
                src="https://github.com/1sanadsa1997-ui/PromoHive/blob/codegen-artifacts-store/public/logo-ibrahim.png?raw=true" 
                alt="Ibrahim Logo" 
                className="w-24 h-24 object-contain relative z-10 drop-shadow-lg"
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.nextSibling.style.display = 'flex'
                }}
              />
              <div className="hidden items-center space-x-2 relative z-10">
                <DollarSign className="h-10 w-10 text-white drop-shadow-lg" />
                <TrendingUp className="h-8 w-8 text-white drop-shadow-lg" />
              </div>
              
              {/* Sparkle Effects */}
              <Star className="absolute top-2 right-2 h-4 w-4 text-yellow-300 animate-pulse" />
              <Star className="absolute bottom-2 left-2 h-3 w-3 text-yellow-200 animate-pulse" style={{animationDelay: '0.5s'}} />
            </div>
            
            <div className="space-y-3">
              <h1 className="text-5xl font-black bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent animate-pulse">
                Ibrahim
              </h1>
              <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 drop-shadow-sm">
                إبراهيم
              </h2>
              <p className="text-sm font-bold text-gray-600 dark:text-gray-400 tracking-widest uppercase">
                ACCOUNTING SYSTEM
              </p>
              <div className="flex items-center justify-center space-x-2 text-orange-500">
                <Sparkles className="h-5 w-5 animate-spin" style={{animationDuration: '3s'}} />
                <span className="text-sm font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  نظام المحاسبة المتطور
                </span>
                <Sparkles className="h-5 w-5 animate-spin" style={{animationDuration: '3s', animationDelay: '1.5s'}} />
              </div>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mt-6 text-lg font-medium">
              {t('auth.signInToAccount') || 'تسجيل الدخول إلى حسابك'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl animate-pulse relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-pink-500/10"></div>
              <p className="text-red-600 dark:text-red-400 text-sm text-center font-bold relative z-10">
                <Shield className="inline h-4 w-4 mr-2" />
                {error}
              </p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="space-y-3">
              <label htmlFor="email" className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                <Mail className="inline h-4 w-4 mr-2 text-orange-500" />
                {t('auth.email') || 'البريد الإلكتروني'}
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-all duration-300 group-focus-within:scale-110" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-orange-500 dark:focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 dark:bg-gray-700 dark:text-white transition-all duration-300 text-lg font-medium hover:border-orange-300 dark:hover:border-orange-400 hover:shadow-lg focus:shadow-xl transform focus:scale-105"
                  placeholder={t('auth.emailPlaceholder') || 'أدخل بريدك الإلكتروني'}
                  required
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-500/10 to-red-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </div>

            <div className="space-y-3">
              <label htmlFor="password" className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                <Lock className="inline h-4 w-4 mr-2 text-orange-500" />
                {t('auth.password') || 'كلمة المرور'}
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-all duration-300 group-focus-within:scale-110" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-12 pr-12 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-orange-500 dark:focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 dark:bg-gray-700 dark:text-white transition-all duration-300 text-lg font-medium hover:border-orange-300 dark:hover:border-orange-400 hover:shadow-lg focus:shadow-xl transform focus:scale-105"
                  placeholder={t('auth.passwordPlaceholder') || 'أدخل كلمة المرور'}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-all duration-300 hover:scale-110"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-500/10 to-red-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading || !formData.email || !formData.password}
              className="w-full h-16 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600 text-white font-black text-xl rounded-xl shadow-2xl transform hover:scale-105 hover:-rotate-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400/50 to-red-400/50 animate-pulse"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {isLoading ? (
                <div className="flex items-center justify-center space-x-3 relative z-10">
                  <div className="w-7 h-7 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="font-black">{t('common.loading') || 'جاري التحميل...'}</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-3 relative z-10">
                  <LogIn className="h-6 w-6" />
                  <span className="font-black">{t('auth.signIn') || 'تسجيل الدخول'}</span>
                  <Sparkles className="h-5 w-5 animate-pulse" />
                </div>
              )}
              
              {/* Button Shine Effect */}
              <div className="absolute inset-0 -top-2 -bottom-2 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </button>
          </form>

          {/* Demo Access Info */}
          <div className="mt-8 pt-6 border-t-2 border-gradient-to-r from-orange-200 to-red-200 dark:from-orange-800 dark:to-red-800 relative">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 px-4">
              <Sparkles className="h-6 w-6 text-orange-500 animate-spin" style={{animationDuration: '3s'}} />
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4 font-bold">
              {t('auth.demoAccounts') || 'للحصول على بيانات تجريبية'}
            </p>
            
            <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 p-6 rounded-xl border-2 border-blue-200 dark:border-blue-800 relative overflow-hidden group hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative z-10 text-center">
                <div className="flex justify-center mb-3">
                  <div className="p-3 bg-blue-500 rounded-full">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                </div>
                
                <p className="text-blue-900 dark:text-blue-100 text-lg font-black mb-2">
                  📞 للحصول على بيانات الدخول التجريبية
                </p>
                <p className="text-blue-700 dark:text-blue-300 text-sm font-medium">
                  يرجى التواصل معنا عبر WhatsApp أو البريد الإلكتروني
                </p>
                <p className="text-blue-600 dark:text-blue-400 text-xs mt-2 font-bold">
                  🔒 حماية كاملة لبياناتك وخصوصيتك
                </p>
              </div>
            </div>
          </div>

          {/* Support */}
          <div className="mt-6 text-center relative z-10">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {t('auth.needHelp') || 'تحتاج مساعدة؟'}
            </p>
            <a
              href="https://wa.me/963994054027"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-110 hover:rotate-1 shadow-lg hover:shadow-xl"
            >
              <span>{t('auth.contactSupport') || 'تواصل معنا'}</span>
              <span className="text-lg">📱</span>
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            © 2024 Ibrahim Accounting System. All rights reserved.
          </p>
          <div className="flex justify-center space-x-2 mt-2">
            <Star className="h-3 w-3 text-orange-400 animate-pulse" />
            <Star className="h-3 w-3 text-red-400 animate-pulse" style={{animationDelay: '0.5s'}} />
            <Star className="h-3 w-3 text-pink-400 animate-pulse" style={{animationDelay: '1s'}} />
          </div>
        </div>
      </div>
    </div>
  )
}

