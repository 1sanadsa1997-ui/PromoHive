import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Alert, AlertDescription } from '../ui/alert'
import { 
  Crown, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  ExternalLink,
  MessageCircle
} from 'lucide-react'
import UpgradeModal from './UpgradeModal'

const SubscriptionStatus = () => {
  const { t } = useTranslation()
  const { subscription, user } = useAuth()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  if (!subscription) {
    return null
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'trial':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'expired':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4" />
      case 'trial':
        return <Clock className="w-4 h-4" />
      case 'expired':
        return <AlertTriangle className="w-4 h-4" />
      case 'cancelled':
        return <AlertTriangle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'نشط'
      case 'trial':
        return 'تجربة مجانية'
      case 'expired':
        return 'منتهي الصلاحية'
      case 'cancelled':
        return 'ملغي'
      default:
        return 'غير معروف'
    }
  }

  const getPlanName = (plan) => {
    switch (plan) {
      case 'monthly':
        return 'خطة شهرية'
      case 'semi_annual':
        return 'خطة نصف سنوية'
      case 'annual':
        return 'خطة سنوية'
      default:
        return plan
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const isExpiringSoon = subscription.days_left <= 7 && subscription.days_left > 0
  const isExpired = subscription.days_left <= 0 || subscription.subscription_status === 'expired'

  return (
    <>
      <Card className={`border-l-4 ${
        isExpired 
          ? 'border-l-red-500 bg-red-50 dark:bg-red-900/10' 
          : isExpiringSoon 
            ? 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/10'
            : 'border-l-green-500 bg-green-50 dark:bg-green-900/10'
      }`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Crown className="w-6 h-6 text-yellow-600" />
              <div>
                <CardTitle className="text-lg">حالة الاشتراك</CardTitle>
                <CardDescription>
                  متجر: {subscription.store_name}
                </CardDescription>
              </div>
            </div>
            <Badge className={getStatusColor(subscription.subscription_status)}>
              <div className="flex items-center space-x-1">
                {getStatusIcon(subscription.subscription_status)}
                <span>{getStatusText(subscription.subscription_status)}</span>
              </div>
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Subscription Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium">الخطة الحالية</p>
                <p className="text-sm text-gray-600">
                  {getPlanName(subscription.subscription_plan)}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium">تاريخ الانتهاء</p>
                <p className="text-sm text-gray-600">
                  {formatDate(subscription.end_date)}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium">الأيام المتبقية</p>
                <p className={`text-sm font-semibold ${
                  isExpired 
                    ? 'text-red-600' 
                    : isExpiringSoon 
                      ? 'text-yellow-600' 
                      : 'text-green-600'
                }`}>
                  {subscription.days_left > 0 ? `${subscription.days_left} يوم` : 'منتهي'}
                </p>
              </div>
            </div>
          </div>

          {/* Status Alerts */}
          {isExpired && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                انتهت صلاحية اشتراكك. يرجى تجديد الاشتراك لمتابعة استخدام جميع ميزات النظام.
              </AlertDescription>
            </Alert>
          )}

          {isExpiringSoon && !isExpired && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                ستنتهي صلاحية اشتراكك خلال {subscription.days_left} أيام. 
                يرجى تجديد الاشتراك لتجنب انقطاع الخدمة.
              </AlertDescription>
            </Alert>
          )}

          {subscription.subscription_status === 'trial' && subscription.days_left > 7 && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                تستمتع حالياً بالتجربة المجانية لمدة 30 يوم. 
                يمكنك ترقية اشتراكك في أي وقت للحصول على المزيد من الميزات.
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-2">
            {(isExpired || isExpiringSoon || subscription.subscription_status === 'trial') && (
              <Button 
                onClick={() => setShowUpgradeModal(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <Crown className="w-4 h-4 mr-2" />
                {isExpired ? 'تجديد الاشتراك' : 'ترقية الاشتراك'}
              </Button>
            )}

            <Button 
              variant="outline"
              onClick={() => window.open('https://wa.me/963994054027?text=' + encodeURIComponent(
                `مرحباً، أريد الاستفسار عن اشتراك متجر "${subscription.store_name}"`
              ), '_blank')}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              تواصل معنا
            </Button>

            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => window.open('/subscription', '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              تفاصيل الاشتراك
            </Button>
          </div>

          {/* Plan Features Preview */}
          {subscription.plan_details && (
            <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border">
              <h4 className="font-medium mb-2">ميزات خطتك الحالية:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {subscription.plan_details.features?.slice(0, 4).map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              {subscription.plan_details.features?.length > 4 && (
                <p className="text-sm text-gray-500 mt-2">
                  +{subscription.plan_details.features.length - 4} ميزة إضافية
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upgrade Modal */}
      <UpgradeModal 
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentPlan={subscription.subscription_plan}
        storeId={subscription.store_id}
        storeName={subscription.store_name}
      />
    </>
  )
}

export default SubscriptionStatus
