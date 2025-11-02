import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Alert, AlertDescription } from '../ui/alert'
import { 
  Crown, 
  Check, 
  Star, 
  MessageCircle, 
  ExternalLink,
  Loader2,
  DollarSign,
  Calendar,
  Zap
} from 'lucide-react'

const UpgradeModal = ({ isOpen, onClose, currentPlan, storeId, storeName }) => {
  const { t } = useTranslation()
  const [plans, setPlans] = useState({})
  const [loading, setLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [whatsappLink, setWhatsappLink] = useState('')

  useEffect(() => {
    if (isOpen) {
      fetchPlans()
    }
  }, [isOpen])

  const fetchPlans = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/subscription/plans')
      const data = await response.json()
      
      if (data.success) {
        setPlans(data.data)
      }
    } catch (error) {
      console.error('Error fetching plans:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateWhatsAppLink = async (planType) => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch('/api/subscription/whatsapp-upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ plan: planType })
      })

      const data = await response.json()
      
      if (data.success) {
        setWhatsappLink(data.data.whatsapp_link)
        window.open(data.data.whatsapp_link, '_blank')
      }
    } catch (error) {
      console.error('Error generating WhatsApp link:', error)
    }
  }

  const handlePlanSelect = (planType) => {
    setSelectedPlan(planType)
    generateWhatsAppLink(planType)
  }

  const getPlanIcon = (planType) => {
    switch (planType) {
      case 'monthly':
        return <Calendar className="w-6 h-6" />
      case 'semi_annual':
        return <Star className="w-6 h-6" />
      case 'annual':
        return <Crown className="w-6 h-6" />
      default:
        return <Zap className="w-6 h-6" />
    }
  }

  const getPlanColor = (planType) => {
    switch (planType) {
      case 'monthly':
        return 'from-blue-500 to-blue-600'
      case 'semi_annual':
        return 'from-purple-500 to-purple-600'
      case 'annual':
        return 'from-yellow-500 to-yellow-600'
      default:
        return 'from-gray-500 to-gray-600'
    }
  }

  const isCurrentPlan = (planType) => planType === currentPlan

  const getSavingsText = (planType) => {
    if (planType === 'semi_annual') {
      return 'وفر 50% مقارنة بالخطة الشهرية'
    }
    if (planType === 'annual') {
      return 'وفر 67% مقارنة بالخطة الشهرية'
    }
    return null
  }

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="ml-2">جاري تحميل خطط الاشتراك...</span>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            ترقية اشتراك متجر "{storeName}"
          </DialogTitle>
          <DialogDescription className="text-center">
            اختر الخطة المناسبة لاحتياجات متجرك واستمتع بجميع الميزات المتقدمة
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {Object.entries(plans).map(([planType, plan]) => (
            <Card 
              key={planType}
              className={`relative transition-all duration-300 hover:shadow-lg ${
                isCurrentPlan(planType) 
                  ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                  : 'hover:shadow-xl'
              } ${planType === 'semi_annual' ? 'scale-105 border-purple-500' : ''}`}
            >
              {planType === 'semi_annual' && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-purple-600 text-white px-3 py-1">
                    الأكثر شعبية
                  </Badge>
                </div>
              )}

              {isCurrentPlan(planType) && (
                <div className="absolute -top-3 right-3">
                  <Badge className="bg-green-600 text-white px-3 py-1">
                    خطتك الحالية
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className={`mx-auto w-16 h-16 rounded-full bg-gradient-to-r ${getPlanColor(planType)} flex items-center justify-center text-white mb-4`}>
                  {getPlanIcon(planType)}
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="mt-2">
                  <span className="text-3xl font-bold">${plan.price}</span>
                  <span className="text-gray-500 ml-1">
                    / {planType === 'monthly' ? 'شهر' : planType === 'semi_annual' ? '6 أشهر' : 'سنة'}
                  </span>
                </div>
                {getSavingsText(planType) && (
                  <p className="text-sm text-green-600 font-medium mt-1">
                    {getSavingsText(planType)}
                  </p>
                )}
                <CardDescription className="mt-2">
                  صالح لمدة {plan.duration} يوم
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4">
                  {isCurrentPlan(planType) ? (
                    <Button 
                      disabled 
                      className="w-full"
                      variant="outline"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      خطتك الحالية
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => handlePlanSelect(planType)}
                      className={`w-full bg-gradient-to-r ${getPlanColor(planType)} hover:opacity-90 text-white`}
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      اختيار هذه الخطة
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Payment Instructions */}
        <Alert className="mt-6">
          <MessageCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">كيفية إتمام الترقية:</p>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>اختر الخطة المناسبة لك من الأعلى</li>
                <li>سيتم توجيهك إلى WhatsApp للتواصل مع فريق الدعم</li>
                <li>سيقوم فريق الدعم بإرسال تفاصيل الدفع</li>
                <li>بعد تأكيد الدفع، سيتم تفعيل اشتراكك فوراً</li>
              </ol>
            </div>
          </AlertDescription>
        </Alert>

        {/* Contact Information */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6 mt-6">
          <div className="text-center">
            <h3 className="font-semibold text-lg mb-2">هل تحتاج مساعدة في الاختيار؟</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              فريق الدعم الفني متاح لمساعدتك في اختيار الخطة المناسبة
            </p>
            <div className="flex justify-center space-x-4">
              <Button 
                variant="outline"
                onClick={() => window.open('mailto:systemibrahem@gmail.com', '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                systemibrahem@gmail.com
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.open('https://wa.me/963994054027?text=' + encodeURIComponent(
                  `مرحباً، أريد الاستفسار عن ترقية اشتراك متجر "${storeName}"`
                ), '_blank')}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                +963 994 054 027
              </Button>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="text-center text-sm text-gray-500 mt-4">
          <p>🔒 جميع المدفوعات آمنة ومشفرة. سيتم تفعيل اشتراكك فور تأكيد الدفع.</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default UpgradeModal
