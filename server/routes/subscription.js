import express from 'express'
import { body, validationResult } from 'express-validator'
import subscriptionService from '../services/subscriptionService.js'
import { authenticateToken, checkPermission, auditLog } from '../middleware/auth.js'

const router = express.Router()

// الحصول على معلومات الاشتراك الحالي
router.get('/info', authenticateToken, async (req, res) => {
  try {
    const subscriptionInfo = await subscriptionService.getSubscriptionInfo(req.storeId)

    res.json({
      success: true,
      data: subscriptionInfo
    })
  } catch (error) {
    console.error('Get subscription info route error:', error)
    res.status(500).json({
      error: 'Failed to get subscription info',
      message: error.message
    })
  }
})

// الحصول على خطط الاشتراك المتاحة
router.get('/plans', async (req, res) => {
  try {
    const plans = subscriptionService.getAvailablePlans()

    res.json({
      success: true,
      data: plans
    })
  } catch (error) {
    console.error('Get subscription plans route error:', error)
    res.status(500).json({
      error: 'Failed to get subscription plans',
      message: error.message
    })
  }
})

// إنشاء متجر جديد مع تجربة مجانية (للمالك فقط)
router.post('/create-store', [
  body('store.name')
    .notEmpty()
    .withMessage('اسم المتجر مطلوب')
    .isLength({ min: 2 })
    .withMessage('اسم المتجر يجب أن يكون حرفين على الأقل'),
  body('store.description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('وصف المتجر يجب أن يكون أقل من 500 حرف'),
  body('store.phone')
    .optional()
    .isMobilePhone()
    .withMessage('رقم الهاتف غير صحيح'),
  body('store.address')
    .optional()
    .isLength({ max: 255 })
    .withMessage('العنوان يجب أن يكون أقل من 255 حرف'),
  body('store.default_currency')
    .optional()
    .isIn(['TRY', 'SYP', 'USD'])
    .withMessage('العملة الافتراضية غير مدعومة'),
  body('owner.email')
    .isEmail()
    .withMessage('البريد الإلكتروني غير صحيح'),
  body('owner.username')
    .isLength({ min: 3 })
    .withMessage('اسم المستخدم يجب أن يكون 3 أحرف على الأقل')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('اسم المستخدم يجب أن يحتوي على أحرف وأرقام فقط'),
  body('owner.password')
    .isLength({ min: 6 })
    .withMessage('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('كلمة المرور يجب أن تحتوي على حرف كبير وصغير ورقم'),
  body('owner.full_name')
    .notEmpty()
    .withMessage('الاسم الكامل مطلوب')
    .isLength({ min: 2 })
    .withMessage('الاسم الكامل يجب أن يكون حرفين على الأقل'),
  body('owner.phone')
    .optional()
    .isMobilePhone()
    .withMessage('رقم الهاتف غير صحيح'),
  body('owner.locale')
    .optional()
    .isIn(['ar', 'en', 'tr'])
    .withMessage('اللغة غير مدعومة')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'بيانات غير صحيحة',
        details: errors.array()
      })
    }

    const { store, owner } = req.body

    const result = await subscriptionService.createStoreWithTrial(store, owner)

    res.status(201).json({
      success: true,
      message: 'تم إنشاء المتجر بنجاح مع تجربة مجانية 30 يوم',
      data: result
    })
  } catch (error) {
    console.error('Create store route error:', error)
    res.status(400).json({
      error: 'Store creation failed',
      message: error.message
    })
  }
})

// ترقية الاشتراك
router.post('/upgrade', [
  authenticateToken,
  checkPermission('store_manager'),
  auditLog('UPGRADE_SUBSCRIPTION', 'stores'),
  body('plan')
    .isIn(['monthly', 'semi_annual', 'annual'])
    .withMessage('خطة الاشتراك غير صحيحة')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'بيانات غير صحيحة',
        details: errors.array()
      })
    }

    const { plan } = req.body

    const result = await subscriptionService.upgradeSubscription(req.storeId, plan, req.userId)

    res.json({
      success: true,
      message: 'تم ترقية الاشتراك بنجاح',
      data: result
    })
  } catch (error) {
    console.error('Upgrade subscription route error:', error)
    res.status(400).json({
      error: 'Subscription upgrade failed',
      message: error.message
    })
  }
})

// إلغاء الاشتراك
router.post('/cancel', [
  authenticateToken,
  checkPermission('store_manager'),
  auditLog('CANCEL_SUBSCRIPTION', 'stores')
], async (req, res) => {
  try {
    const result = await subscriptionService.cancelSubscription(req.storeId, req.userId)

    res.json({
      success: true,
      message: 'تم إلغاء الاشتراك بنجاح',
      data: result
    })
  } catch (error) {
    console.error('Cancel subscription route error:', error)
    res.status(400).json({
      error: 'Subscription cancellation failed',
      message: error.message
    })
  }
})

// إنشاء رابط WhatsApp للترقية
router.post('/whatsapp-upgrade', [
  authenticateToken,
  checkPermission('store_manager'),
  body('plan')
    .isIn(['monthly', 'semi_annual', 'annual'])
    .withMessage('خطة الاشتراك غير صحيحة')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'بيانات غير صحيحة',
        details: errors.array()
      })
    }

    const { plan } = req.body

    // الحصول على اسم المتجر
    const subscriptionInfo = await subscriptionService.getSubscriptionInfo(req.storeId)
    
    const whatsappLink = subscriptionService.generateWhatsAppUpgradeLink(
      plan, 
      req.storeId, 
      subscriptionInfo.store_name
    )

    res.json({
      success: true,
      message: 'تم إنشاء رابط WhatsApp بنجاح',
      data: {
        whatsapp_link: whatsappLink,
        plan: plan,
        store_id: req.storeId,
        store_name: subscriptionInfo.store_name
      }
    })
  } catch (error) {
    console.error('Generate WhatsApp link route error:', error)
    res.status(400).json({
      error: 'WhatsApp link generation failed',
      message: error.message
    })
  }
})

// التحقق من الاشتراكات المنتهية (للمالك فقط)
router.post('/check-expired', [
  authenticateToken,
  checkPermission('system_owner')
], async (req, res) => {
  try {
    const result = await subscriptionService.checkExpiredSubscriptions()

    res.json({
      success: true,
      message: 'تم التحقق من الاشتراكات المنتهية',
      data: result
    })
  } catch (error) {
    console.error('Check expired subscriptions route error:', error)
    res.status(500).json({
      error: 'Failed to check expired subscriptions',
      message: error.message
    })
  }
})

// إرسال تنبيهات انتهاء الاشتراك (للمالك فقط)
router.post('/send-expiry-warnings', [
  authenticateToken,
  checkPermission('system_owner')
], async (req, res) => {
  try {
    const result = await subscriptionService.sendExpiryWarnings()

    res.json({
      success: true,
      message: 'تم إرسال تنبيهات انتهاء الاشتراك',
      data: result
    })
  } catch (error) {
    console.error('Send expiry warnings route error:', error)
    res.status(500).json({
      error: 'Failed to send expiry warnings',
      message: error.message
    })
  }
})

export default router
