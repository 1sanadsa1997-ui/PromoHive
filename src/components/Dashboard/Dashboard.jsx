import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  Users, 
  FileText,
  AlertTriangle,
  Calendar,
  BarChart3,
  PlusCircle,
  MessageSquare
} from 'lucide-react'
import SubscriptionStatus from '../Subscription/SubscriptionStatus'

const Dashboard = () => {
  const { t } = useTranslation()
  const { user, subscription } = useAuth()
  const [dashboardData, setDashboardData] = useState({
    totalRevenue: { amount: 0, currency: 'SYP', change: 0 },
    totalExpenses: { amount: 0, currency: 'SYP', change: 0 },
    netProfit: { amount: 0, currency: 'SYP', change: 0 },
    lowStockItems: 0,
    pendingInvoices: 0,
    totalEmployees: 0,
    recentTransactions: [],
    currencyBreakdown: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      // هنا سيتم جلب البيانات من API
      // مؤقتاً سنستخدم بيانات تجريبية
      setTimeout(() => {
        setDashboardData({
          totalRevenue: { amount: 2500000, currency: 'SYP', change: 12.5 },
          totalExpenses: { amount: 1800000, currency: 'SYP', change: -5.2 },
          netProfit: { amount: 700000, currency: 'SYP', change: 25.8 },
          lowStockItems: 3,
          pendingInvoices: 5,
          totalEmployees: 8,
          recentTransactions: [
            { id: 1, type: 'income', description: 'بيع لابتوب ديل', amount: 850000, currency: 'SYP', date: '2024-11-02' },
            { id: 2, type: 'expense', description: 'شراء مواد مكتبية', amount: 45000, currency: 'SYP', date: '2024-11-01' },
            { id: 3, type: 'income', description: 'خدمة صيانة', amount: 120000, currency: 'SYP', date: '2024-11-01' }
          ],
          currencyBreakdown: [
            { currency: 'SYP', amount: 2500000, percentage: 85 },
            { currency: 'USD', amount: 500, percentage: 10 },
            { currency: 'TRY', amount: 1200, percentage: 5 }
          ]
        })
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setLoading(false)
    }
  }

  const formatCurrency = (amount, currency) => {
    const symbols = { SYP: 'ل.س', USD: '$', TRY: '₺' }
    return `${amount.toLocaleString()} ${symbols[currency] || currency}`
  }

  const getChangeColor = (change) => {
    if (change > 0) return 'text-green-600'
    if (change < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  const getChangeIcon = (change) => {
    if (change > 0) return <TrendingUp className="w-4 h-4" />
    if (change < 0) return <TrendingDown className="w-4 h-4" />
    return null
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded-lg"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('dashboard.welcome')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            مرحباً {user?.full_name}، إليك نظرة عامة على أداء متجرك
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            هذا الشهر
          </Button>
          <Button variant="outline" size="sm">
            <BarChart3 className="w-4 h-4 mr-2" />
            {t('dashboard.viewReports')}
          </Button>
        </div>
      </div>

      {/* Subscription Status */}
      <SubscriptionStatus />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.totalRevenue')}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(dashboardData.totalRevenue.amount, dashboardData.totalRevenue.currency)}
            </div>
            <div className={`flex items-center text-xs ${getChangeColor(dashboardData.totalRevenue.change)}`}>
              {getChangeIcon(dashboardData.totalRevenue.change)}
              <span className="ml-1">
                {Math.abs(dashboardData.totalRevenue.change)}% من الشهر الماضي
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Total Expenses */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.totalExpenses')}
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(dashboardData.totalExpenses.amount, dashboardData.totalExpenses.currency)}
            </div>
            <div className={`flex items-center text-xs ${getChangeColor(dashboardData.totalExpenses.change)}`}>
              {getChangeIcon(dashboardData.totalExpenses.change)}
              <span className="ml-1">
                {Math.abs(dashboardData.totalExpenses.change)}% من الشهر الماضي
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Net Profit */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.netProfit')}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(dashboardData.netProfit.amount, dashboardData.netProfit.currency)}
            </div>
            <div className={`flex items-center text-xs ${getChangeColor(dashboardData.netProfit.change)}`}>
              {getChangeIcon(dashboardData.netProfit.change)}
              <span className="ml-1">
                {Math.abs(dashboardData.netProfit.change)}% من الشهر الماضي
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              التنبيهات
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.lowStockItems + dashboardData.pendingInvoices}
            </div>
            <div className="text-xs text-muted-foreground">
              {dashboardData.lowStockItems} نقص مخزون، {dashboardData.pendingInvoices} فواتير معلقة
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.quickActions')}</CardTitle>
          <CardDescription>
            الإجراءات الأكثر استخداماً
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
              <PlusCircle className="w-6 h-6" />
              <span className="text-sm">{t('dashboard.addInvoice')}</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
              <Package className="w-6 h-6" />
              <span className="text-sm">{t('dashboard.addProduct')}</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
              <Users className="w-6 h-6" />
              <span className="text-sm">{t('dashboard.addEmployee')}</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
              <FileText className="w-6 h-6" />
              <span className="text-sm">{t('dashboard.viewReports')}</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions & Currency Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.recentTransactions')}</CardTitle>
            <CardDescription>
              آخر المعاملات المالية
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      transaction.type === 'income' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <div>
                      <p className="font-medium text-sm">{transaction.description}</p>
                      <p className="text-xs text-gray-500">{transaction.date}</p>
                    </div>
                  </div>
                  <div className={`font-medium ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount, transaction.currency)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Currency Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>توزيع العملات</CardTitle>
            <CardDescription>
              الإيرادات حسب العملة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.currencyBreakdown.map((item) => (
                <div key={item.currency} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline">{item.currency}</Badge>
                    <span className="text-sm font-medium">
                      {formatCurrency(item.amount, item.currency)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500">{item.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Support Contact */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg mb-2">هل تحتاج مساعدة؟</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                فريق الدعم الفني متاح لمساعدتك في أي وقت
              </p>
              <div className="flex space-x-4">
                <a
                  href="mailto:systemibrahem@gmail.com"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  systemibrahem@gmail.com
                </a>
                <a
                  href="https://wa.me/963994054027"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-800 text-sm font-medium"
                >
                  +963 994 054 027
                </a>
              </div>
            </div>
            <MessageSquare className="w-12 h-12 text-blue-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Dashboard
