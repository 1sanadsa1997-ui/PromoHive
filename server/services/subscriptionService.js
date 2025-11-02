import { supabaseAdmin } from '../config/supabase.js'

class SubscriptionService {
  // خطط الاشتراك المتاحة
  static PLANS = {
    monthly: {
      name: 'خطة شهرية',
      price: 5,
      currency: 'USD',
      duration: 30, // أيام
      features: [
        'إدارة الواردات والصادرات',
        'إدارة المستودع',
        'إدارة الموظفين والرواتب',
        'التقارير الأساسية',
        'دعم العملات المتعددة',
        'النسخ الاحتياطي التلقائي'
      ]
    },
    semi_annual: {
      name: 'خطة نصف سنوية',
      price: 30,
      currency: 'USD',
      duration: 180, // أيام
      features: [
        'جميع ميزات الخطة الشهرية',
        'التقارير المتقدمة',
        'تصدير PDF/Excel',
        'التنبيهات الذكية',
        'دعم أولوية'
      ]
    },
    annual: {
      name: 'خطة سنوية',
      price: 40,
      currency: 'USD',
      duration: 365, // أيام
      features: [
        'جميع ميزات الخطة نصف السنوية',
        'تقارير مخصصة',
        'تكامل API',
        'دعم مخصص',
        'تدريب مجاني'
      ]
    }
  }

  // الحصول على معلومات الاشتراك للمتجر
  async getSubscriptionInfo(storeId) {
    try {
      const { data: store, error } = await supabaseAdmin
        .from('stores')
        .select(`
          id,
          name,
          subscription_status,
          subscription_start_date,
          subscription_end_date,
          subscription_plan
        `)
        .eq('id', storeId)
        .single()

      if (error || !store) {
        throw new Error('المتجر غير موجود')
      }

      const now = new Date()
      const endDate = new Date(store.subscription_end_date)
      const daysLeft = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24))

      return {
        store_id: store.id,
        store_name: store.name,
        subscription_status: store.subscription_status,
        subscription_plan: store.subscription_plan,
        start_date: store.subscription_start_date,
        end_date: store.subscription_end_date,
        days_left: Math.max(0, daysLeft),
        is_active: (store.subscription_status === 'active' || store.subscription_status === 'trial') && daysLeft > 0,
        plan_details: SubscriptionService.PLANS[store.subscription_plan] || null
      }
    } catch (error) {
      console.error('Get subscription info error:', error)
      throw error
    }
  }

  // إنشاء متجر جديد مع تجربة مجانية
  async createStoreWithTrial(storeData, ownerData) {
    try {
      // بدء معاملة
      const { data: store, error: storeError } = await supabaseAdmin
        .from('stores')
        .insert({
          name: storeData.name,
          description: storeData.description,
          owner_email: ownerData.email,
          phone: storeData.phone,
          address: storeData.address,
          default_currency: storeData.default_currency || 'USD',
          subscription_status: 'trial',
          subscription_start_date: new Date().toISOString(),
          subscription_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 يوم
          subscription_plan: 'monthly'
        })
        .select()
        .single()

      if (storeError) {
        throw new Error('خطأ في إنشاء المتجر')
      }

      // إنشاء مدير المتجر
      const bcrypt = await import('bcrypt')
      const hashedPassword = await bcrypt.hash(ownerData.password, 12)

      const { data: user, error: userError } = await supabaseAdmin
        .from('users')
        .insert({
          store_id: store.id,
          email: ownerData.email,
          username: ownerData.username,
          password_hash: hashedPassword,
          full_name: ownerData.full_name,
          role: 'store_manager',
          permissions: { all: true },
          phone: ownerData.phone,
          locale: ownerData.locale || 'ar',
          theme: 'light'
        })
        .select()
        .single()

      if (userError) {
        // حذف المتجر في حالة فشل إنشاء المستخدم
        await supabaseAdmin.from('stores').delete().eq('id', store.id)
        throw new Error('خطأ في إنشاء مدير المتجر')
      }

      // إنشاء تنبيه ترحيبي
      await supabaseAdmin
        .from('alerts')
        .insert({
          store_id: store.id,
          type: 'welcome',
          title: 'مرحباً بك في نظام إبراهيم للمحاسبة',
          message: `تم إنشاء متجرك "${store.name}" بنجاح. يمكنك الآن البدء في استخدام جميع ميزات النظام خلال فترة التجربة المجانية 30 يوم.`,
          severity: 'info',
          target_user_id: user.id
        })

      return {
        store: {
          id: store.id,
          name: store.name,
          subscription_status: store.subscription_status,
          subscription_end_date: store.subscription_end_date,
          trial_days_left: 30
        },
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          full_name: user.full_name,
          role: user.role
        }
      }
    } catch (error) {
      console.error('Create store with trial error:', error)
      throw error
    }
  }

  // ترقية الاشتراك
  async upgradeSubscription(storeId, planType, userId) {
    try {
      const plan = SubscriptionService.PLANS[planType]
      if (!plan) {
        throw new Error('خطة الاشتراك غير موجودة')
      }

      // الحصول على معلومات المتجر الحالية
      const { data: store, error } = await supabaseAdmin
        .from('stores')
        .select('subscription_end_date, subscription_status')
        .eq('id', storeId)
        .single()

      if (error || !store) {
        throw new Error('المتجر غير موجود')
      }

      // حساب تاريخ الانتهاء الجديد
      const now = new Date()
      let startDate = now
      
      // إذا كان الاشتراك الحالي نشط، نبدأ من تاريخ انتهائه
      if (store.subscription_status === 'active' && new Date(store.subscription_end_date) > now) {
        startDate = new Date(store.subscription_end_date)
      }

      const endDate = new Date(startDate.getTime() + plan.duration * 24 * 60 * 60 * 1000)

      // تحديث الاشتراك
      const { error: updateError } = await supabaseAdmin
        .from('stores')
        .update({
          subscription_status: 'active',
          subscription_plan: planType,
          subscription_start_date: startDate.toISOString(),
          subscription_end_date: endDate.toISOString(),
          updated_at: now.toISOString()
        })
        .eq('id', storeId)

      if (updateError) {
        throw new Error('خطأ في ترقية الاشتراك')
      }

      // إنشاء تنبيه بالترقية
      await supabaseAdmin
        .from('alerts')
        .insert({
          store_id: storeId,
          type: 'subscription_upgraded',
          title: 'تم ترقية الاشتراك بنجاح',
          message: `تم ترقية اشتراكك إلى ${plan.name} بنجاح. الاشتراك ساري حتى ${endDate.toLocaleDateString('ar-SA')}.`,
          severity: 'info',
          target_role: 'store_manager'
        })

      return {
        success: true,
        plan: planType,
        plan_name: plan.name,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        days_added: plan.duration
      }
    } catch (error) {
      console.error('Upgrade subscription error:', error)
      throw error
    }
  }

  // إلغاء الاشتراك
  async cancelSubscription(storeId, userId) {
    try {
      const { error } = await supabaseAdmin
        .from('stores')
        .update({
          subscription_status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', storeId)

      if (error) {
        throw new Error('خطأ في إلغاء الاشتراك')
      }

      // إنشاء تنبيه بالإلغاء
      await supabaseAdmin
        .from('alerts')
        .insert({
          store_id: storeId,
          type: 'subscription_cancelled',
          title: 'تم إلغاء الاشتراك',
          message: 'تم إلغاء اشتراكك. ستتمكن من استخدام النظام حتى نهاية الفترة المدفوعة.',
          severity: 'warning',
          target_role: 'store_manager'
        })

      return { success: true }
    } catch (error) {
      console.error('Cancel subscription error:', error)
      throw error
    }
  }

  // التحقق من الاشتراكات المنتهية الصلاحية
  async checkExpiredSubscriptions() {
    try {
      const now = new Date()
      
      // البحث عن الاشتراكات المنتهية
      const { data: expiredStores, error } = await supabaseAdmin
        .from('stores')
        .select('id, name, subscription_end_date, owner_email')
        .lt('subscription_end_date', now.toISOString())
        .in('subscription_status', ['active', 'trial'])

      if (error) {
        throw new Error('خطأ في البحث عن الاشتراكات المنتهية')
      }

      // تحديث حالة الاشتراكات المنتهية
      for (const store of expiredStores) {
        await supabaseAdmin
          .from('stores')
          .update({
            subscription_status: 'expired',
            updated_at: now.toISOString()
          })
          .eq('id', store.id)

        // إنشاء تنبيه انتهاء الاشتراك
        await supabaseAdmin
          .from('alerts')
          .insert({
            store_id: store.id,
            type: 'subscription_expired',
            title: 'انتهت صلاحية الاشتراك',
            message: 'انتهت صلاحية اشتراكك. يرجى تجديد الاشتراك لمتابعة استخدام النظام.',
            severity: 'error',
            target_role: 'store_manager'
          })
      }

      return {
        expired_count: expiredStores.length,
        expired_stores: expiredStores.map(store => ({
          id: store.id,
          name: store.name,
          owner_email: store.owner_email
        }))
      }
    } catch (error) {
      console.error('Check expired subscriptions error:', error)
      throw error
    }
  }

  // إرسال تنبيهات انتهاء الاشتراك قريباً
  async sendExpiryWarnings() {
    try {
      const now = new Date()
      const warningDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 أيام من الآن

      // البحث عن الاشتراكات التي ستنتهي خلال 7 أيام
      const { data: expiringStores, error } = await supabaseAdmin
        .from('stores')
        .select('id, name, subscription_end_date, subscription_plan')
        .lt('subscription_end_date', warningDate.toISOString())
        .gt('subscription_end_date', now.toISOString())
        .in('subscription_status', ['active', 'trial'])

      if (error) {
        throw new Error('خطأ في البحث عن الاشتراكات المنتهية قريباً')
      }

      // إرسال تنبيهات
      for (const store of expiringStores) {
        const endDate = new Date(store.subscription_end_date)
        const daysLeft = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24))

        await supabaseAdmin
          .from('alerts')
          .insert({
            store_id: store.id,
            type: 'subscription_expiring',
            title: 'ستنتهي صلاحية الاشتراك قريباً',
            message: `ستنتهي صلاحية اشتراكك خلال ${daysLeft} أيام. يرجى تجديد الاشتراك لتجنب انقطاع الخدمة.`,
            severity: 'warning',
            target_role: 'store_manager'
          })
      }

      return {
        warning_count: expiringStores.length,
        expiring_stores: expiringStores.map(store => ({
          id: store.id,
          name: store.name,
          end_date: store.subscription_end_date
        }))
      }
    } catch (error) {
      console.error('Send expiry warnings error:', error)
      throw error
    }
  }

  // الحصول على جميع خطط الاشتراك
  getAvailablePlans() {
    return SubscriptionService.PLANS
  }

  // إنشاء رابط WhatsApp للترقية
  generateWhatsAppUpgradeLink(planType, storeId, storeName) {
    const plan = SubscriptionService.PLANS[planType]
    if (!plan) {
      throw new Error('خطة الاشتراك غير موجودة')
    }

    const phoneNumber = process.env.WHATSAPP_PHONE_NUMBER || '+963994054027'
    const message = `مرحباً، أريد ترقية اشتراك متجر "${storeName}" إلى ${plan.name} بسعر ${plan.price}$ لمدة ${plan.duration} يوم.

معرف المتجر: ${storeId}
الخطة المطلوبة: ${planType}

يرجى تأكيد الترقية وإرسال تفاصيل الدفع.`

    const encodedMessage = encodeURIComponent(message)
    return `https://wa.me/${phoneNumber.replace('+', '')}?text=${encodedMessage}`
  }
}

export default new SubscriptionService()
