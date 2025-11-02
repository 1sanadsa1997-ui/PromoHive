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
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-red-500 to-pink-600 dark:from-orange-900 dark:via-red-900 dark:to-pink-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-yellow-400/40 to-orange-500/40 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-red-400/40 to-pink-500/40 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-orange-500/30 to-red-500/30 rounded-full blur-3xl animate-pulse" style={{animationDelay: '0.5s'}}></div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-20 w-6 h-6 bg-yellow-400 rounded-full animate-bounce opacity-80" style={{animationDelay: '0s'}}></div>
        <div className="absolute top-40 right-32 w-4 h-4 bg-orange-400 rounded-full animate-bounce opacity-70" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute bottom-32 left-40 w-8 h-8 bg-red-400 rounded-full animate-bounce opacity-60" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 right-20 w-5 h-5 bg-pink-400 rounded-full animate-bounce opacity-80" style={{animationDelay: '1.5s'}}></div>
        <div className="absolute top-60 left-60 w-3 h-3 bg-yellow-500 rounded-full animate-bounce opacity-90" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header Controls */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex space-x-2 rtl:space-x-reverse">
            <button
              onClick={() => changeLanguage('ar')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 transform hover:scale-110 hover:rotate-1 ${
                i18n.language === 'ar'
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white shadow-lg shadow-orange-500/25'
                  : 'bg-gradient-to-r from-orange-200 to-red-200 dark:from-orange-800 dark:to-red-800 text-orange-900 dark:text-orange-100 hover:from-orange-300 hover:to-red-300 dark:hover:from-orange-700 dark:hover:to-red-700 backdrop-blur-sm border border-orange-300 dark:border-orange-600'
              }`}
            >
              العربية
            </button>
            <button
              onClick={() => changeLanguage('en')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 transform hover:scale-110 hover:rotate-1 ${
                i18n.language === 'en'
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white shadow-lg shadow-orange-500/25'
                  : 'bg-gradient-to-r from-orange-200 to-red-200 dark:from-orange-800 dark:to-red-800 text-orange-900 dark:text-orange-100 hover:from-orange-300 hover:to-red-300 dark:hover:from-orange-700 dark:hover:to-red-700 backdrop-blur-sm border border-orange-300 dark:border-orange-600'
              }`}
            >
              English
            </button>
            <button
              onClick={() => changeLanguage('tr')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 transform hover:scale-110 hover:rotate-1 ${
                i18n.language === 'tr'
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white shadow-lg shadow-orange-500/25'
                  : 'bg-gradient-to-r from-orange-200 to-red-200 dark:from-orange-800 dark:to-red-800 text-orange-900 dark:text-orange-100 hover:from-orange-300 hover:to-red-300 dark:hover:from-orange-700 dark:hover:to-red-700 backdrop-blur-sm border border-orange-300 dark:border-orange-600'
              }`}
            >
              Türkçe
            </button>
          </div>
          
          <button
            onClick={toggleTheme}
            className="p-3 rounded-xl bg-gradient-to-r from-orange-200 to-red-200 dark:from-orange-800 dark:to-red-800 text-orange-900 dark:text-orange-100 hover:from-orange-300 hover:to-red-300 dark:hover:from-orange-700 dark:hover:to-red-700 transition-all duration-300 transform hover:scale-110 hover:rotate-12 backdrop-blur-sm border border-orange-300 dark:border-orange-600 shadow-lg"
          >
            <Moon className="h-5 w-5 dark:hidden" />
            <Sun className="h-5 w-5 hidden dark:block" />
          </button>
        </div>

        {/* Login Card */}
        <div className="bg-gradient-to-br from-orange-100 via-red-100 to-pink-100 dark:from-orange-900/90 dark:via-red-900/90 dark:to-pink-900/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border-2 border-orange-300/50 dark:border-orange-700/50 relative overflow-hidden">
          {/* Card Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-orange-500/10 to-red-500/10 rounded-3xl"></div>
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500"></div>
          
          {/* Logo and Title */}
          <div className="text-center mb-8 relative z-10">
            {/* Logo */}
            <div className="mx-auto w-32 h-32 bg-gradient-to-br from-yellow-500 via-orange-500 to-red-600 rounded-3xl flex items-center justify-center mb-6 shadow-2xl transform hover:scale-110 hover:rotate-3 transition-all duration-500 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/60 to-red-400/60 animate-pulse"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-300/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <img 
                src="https://github.com/1sanadsa1997-ui/PromoHive/blob/codegen-artifacts-store/public/logo-ibrahim.png?raw=true" 
                alt="Ibrahim Logo" 
                className="w-28 h-28 object-contain relative z-10 drop-shadow-2xl"
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.nextSibling.style.display = 'flex'
                }}
              />
              <div className="hidden items-center space-x-2 relative z-10">
                <DollarSign className="h-12 w-12 text-white drop-shadow-2xl" />
                <TrendingUp className="h-10 w-10 text-white drop-shadow-2xl" />
              </div>
              
              {/* Sparkle Effects */}
              <Star className="absolute top-3 right-3 h-5 w-5 text-yellow-200 animate-pulse" />
              <Star className="absolute bottom-3 left-3 h-4 w-4 text-yellow-100 animate-pulse" style={{animationDelay: '0.5s'}} />
              <Sparkles className="absolute top-6 left-6 h-4 w-4 text-yellow-300 animate-spin" style={{animationDuration: '3s'}} />
            </div>
            
            <div className="space-y-4">
              <h1 className="text-6xl font-black bg-gradient-to-r from-yellow-600 via-orange-700 to-red-700 bg-clip-text text-transparent animate-pulse drop-shadow-lg">
                Ibrahim
              </h1>
              <h2 className="text-4xl font-bold text-orange-800 dark:text-orange-200 drop-shadow-md">
                إبراهيم
              </h2>
              <p className="text-base font-black text-red-700 dark:text-red-300 tracking-widest uppercase drop-shadow-sm">
                ACCOUNTING SYSTEM
              </p>
              <div className="flex items-center justify-center space-x-2 text-orange-600 dark:text-orange-400">
                <Sparkles className="h-6 w-6 animate-spin text-yellow-500" style={{animationDuration: '3s'}} />
                <span className="text-lg font-black bg-gradient-to-r from-orange-700 to-red-700 bg-clip-text text-transparent">
                  نظام المحاسبة المتطور
                </span>
                <Sparkles className="h-6 w-6 animate-spin text-yellow-500" style={{animationDuration: '3s', animationDelay: '1.5s'}} />
              </div>
            </div>
            
            <p className="text-orange-700 dark:text-orange-300 mt-6 text-xl font-bold drop-shadow-sm">
              {t('auth.signInToAccount') || 'تسجيل الدخول إلى حسابك'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-gradient-to-r from-red-200 to-pink-200 dark:from-red-800/80 dark:to-pink-800/80 border-2 border-red-400 dark:border-red-600 rounded-xl animate-pulse relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-pink-500/20"></div>
              <p className="text-red-800 dark:text-red-200 text-sm text-center font-black relative z-10">
                <Shield className="inline h-5 w-5 mr-2" />
                {error}
              </p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="space-y-3">
              <label htmlFor="email" className="block text-base font-black text-orange-800 dark:text-orange-200">
                <Mail className="inline h-5 w-5 mr-2 text-red-600" />
                {t('auth.email') || 'البريد الإلكتروني'}
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-orange-600 group-focus-within:text-red-600 transition-all duration-300 group-focus-within:scale-110" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-14 pr-4 py-5 border-3 border-orange-300 dark:border-orange-600 rounded-xl focus:border-red-500 dark:focus:border-red-400 focus:ring-4 focus:ring-red-500/30 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/50 dark:to-red-900/50 text-orange-900 dark:text-orange-100 transition-all duration-300 text-xl font-bold hover:border-red-400 dark:hover:border-red-500 hover:shadow-xl focus:shadow-2xl transform focus:scale-105"
                  placeholder={t('auth.emailPlaceholder') || 'أدخل بريدك الإلكتروني'}
                  required
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-yellow-500/10 to-red-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </div>

            <div className="space-y-3">
              <label htmlFor="password" className="block text-base font-black text-orange-800 dark:text-orange-200">
                <Lock className="inline h-5 w-5 mr-2 text-red-600" />
                {t('auth.password') || 'كلمة المرور'}
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-orange-600 group-focus-within:text-red-600 transition-all duration-300 group-focus-within:scale-110" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-14 pr-14 py-5 border-3 border-orange-300 dark:border-orange-600 rounded-xl focus:border-red-500 dark:focus:border-red-400 focus:ring-4 focus:ring-red-500/30 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/50 dark:to-red-900/50 text-orange-900 dark:text-orange-100 transition-all duration-300 text-xl font-bold hover:border-red-400 dark:hover:border-red-500 hover:shadow-xl focus:shadow-2xl transform focus:scale-105"
                  placeholder={t('auth.passwordPlaceholder') || 'أدخل كلمة المرور'}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-orange-600 hover:text-red-600 transition-all duration-300 hover:scale-110"
                >
                  {showPassword ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
                </button>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-yellow-500/10 to-red-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading || !formData.email || !formData.password}
              className="w-full h-20 bg-gradient-to-r from-yellow-500 via-orange-600 to-red-600 hover:from-yellow-600 hover:via-orange-700 hover:to-red-700 text-white font-black text-2xl rounded-xl shadow-2xl transform hover:scale-105 hover:-rotate-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group border-2 border-yellow-400"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/60 to-red-400/60 animate-pulse"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-300/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {isLoading ? (
                <div className="flex items-center justify-center space-x-3 relative z-10">
                  <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="font-black text-xl">{t('common.loading') || 'جاري التحميل...'}</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-4 relative z-10">
                  <LogIn className="h-8 w-8" />
                  <span className="font-black text-xl">{t('auth.signIn') || 'تسجيل الدخول'}</span>
                  <Sparkles className="h-6 w-6 animate-pulse" />
                </div>
              )}
              
              {/* Button Shine Effect */}
              <div className="absolute inset-0 -top-2 -bottom-2 bg-gradient-to-r from-transparent via-yellow-300/50 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </button>
          </form>

          {/* Demo Access Info */}
          <div className="mt-8 pt-6 border-t-4 border-gradient-to-r from-orange-400 to-red-400 relative">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900 dark:to-red-900 px-4 rounded-full">
              <Sparkles className="h-8 w-8 text-orange-600 animate-spin" style={{animationDuration: '3s'}} />
            </div>
            
            <p className="text-base text-orange-800 dark:text-orange-200 text-center mb-4 font-black">
              {t('auth.demoAccounts') || 'للحصول على بيانات تجريبية'}
            </p>
            
            <div className="bg-gradient-to-r from-blue-200 via-indigo-200 to-purple-200 dark:from-blue-800/80 dark:via-indigo-800/80 dark:to-purple-800/80 p-6 rounded-xl border-3 border-blue-400 dark:border-blue-600 relative overflow-hidden group hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative z-10 text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                </div>
                
                <p className="text-blue-900 dark:text-blue-100 text-xl font-black mb-3">
                  📞 للحصول على بيانات الدخول التجريبية
                </p>
                <p className="text-blue-800 dark:text-blue-200 text-base font-bold">
                  يرجى التواصل معنا عبر WhatsApp أو البريد الإلكتروني
                </p>
                <p className="text-blue-700 dark:text-blue-300 text-sm mt-3 font-black">
                  🔒 حماية كاملة لبياناتك وخصوصيتك
                </p>
              </div>
            </div>
          </div>

          {/* Support */}
          <div className="mt-6 text-center relative z-10">
            <p className="text-base text-orange-800 dark:text-orange-200 mb-4 font-bold">
              {t('auth.needHelp') || 'تحتاج مساعدة؟'}
            </p>
            <a
              href="https://wa.me/963994054027"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-black text-lg rounded-xl transition-all duration-300 transform hover:scale-110 hover:rotate-1 shadow-2xl hover:shadow-3xl border-2 border-green-400"
            >
              <span>{t('auth.contactSupport') || 'تواصل معنا'}</span>
              <span className="text-2xl">📱</span>
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-orange-200 dark:text-orange-400 font-bold drop-shadow-lg">
            © 2024 Ibrahim Accounting System. All rights reserved.
          </p>
          <div className="flex justify-center space-x-3 mt-3">
            <Star className="h-4 w-4 text-yellow-400 animate-pulse drop-shadow-lg" />
            <Star className="h-4 w-4 text-orange-400 animate-pulse drop-shadow-lg" style={{animationDelay: '0.5s'}} />
            <Star className="h-4 w-4 text-red-400 animate-pulse drop-shadow-lg" style={{animationDelay: '1s'}} />
          </div>
        </div>
      </div>
    </div>
  )
}

