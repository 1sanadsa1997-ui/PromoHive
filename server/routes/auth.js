import express from 'express'
import { body, validationResult } from 'express-validator'
import authService from '../services/authService.js'
import { authenticateToken, auditLog } from '../middleware/auth.js'

const router = express.Router()

// تسجيل الدخول
router.post('/login', [
  body('username')
    .notEmpty()
    .withMessage('اسم المستخدم مطلوب')
    .isLength({ min: 3 })
    .withMessage('اسم المستخدم يجب أن يكون 3 أحرف على الأقل'),
  body('password')
    .notEmpty()
    .withMessage('كلمة المرور مطلوبة')
    .isLength({ min: 6 })
    .withMessage('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
], async (req, res) => {
  try {
    // التحقق من صحة البيانات
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'بيانات غير صحيحة',
        details: errors.array()
      })
    }

    const { username, password } = req.body

    // تسجيل الدخول
    const result = await authService.login(username, password)

    res.json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح',
      data: result
    })
  } catch (error) {
    console.error('Login route error:', error)
    res.status(401).json({
      error: 'Login failed',
      message: error.message
    })
  }
})

// تسجيل الخروج
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    await authService.logout(token)

    res.json({
      success: true,
      message: 'تم تسجيل الخروج بنجاح'
    })
  } catch (error) {
    console.error('Logout route error:', error)
    res.status(500).json({
      error: 'Logout failed',
      message: error.message
    })
  }
})

// تجديد الرمز المميز
router.post('/refresh', [
  body('refresh_token')
    .notEmpty()
    .withMessage('رمز التجديد مطلوب')
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

    const { refresh_token } = req.body

    const result = await authService.refreshToken(refresh_token)

    res.json({
      success: true,
      message: 'تم تجديد الرمز المميز بنجاح',
      data: result
    })
  } catch (error) {
    console.error('Refresh token route error:', error)
    res.status(401).json({
      error: 'Token refresh failed',
      message: error.message
    })
  }
})

// الحصول على معلومات المستخدم الحالي
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const result = await authService.getUserInfo(req.userId)

    res.json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('Get user info route error:', error)
    res.status(500).json({
      error: 'Failed to get user info',
      message: error.message
    })
  }
})

// تحديث الملف الشخصي
router.put('/profile', [
  authenticateToken,
  auditLog('UPDATE', 'users'),
  body('full_name')
    .optional()
    .isLength({ min: 2 })
    .withMessage('الاسم الكامل يجب أن يكون حرفين على الأقل'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('رقم الهاتف غير صحيح'),
  body('locale')
    .optional()
    .isIn(['ar', 'en', 'tr'])
    .withMessage('اللغة غير مدعومة'),
  body('theme')
    .optional()
    .isIn(['light', 'dark'])
    .withMessage('المظهر غير مدعوم')
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

    const result = await authService.updateProfile(req.userId, req.body)

    res.json({
      success: true,
      message: 'تم تحديث الملف الشخصي بنجاح',
      data: result
    })
  } catch (error) {
    console.error('Update profile route error:', error)
    res.status(500).json({
      error: 'Profile update failed',
      message: error.message
    })
  }
})

// تغيير كلمة المرور
router.put('/change-password', [
  authenticateToken,
  auditLog('CHANGE_PASSWORD', 'users'),
  body('current_password')
    .notEmpty()
    .withMessage('كلمة المرور الحالية مطلوبة'),
  body('new_password')
    .isLength({ min: 6 })
    .withMessage('كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('كلمة المرور يجب أن تحتوي على حرف كبير وصغير ورقم'),
  body('confirm_password')
    .custom((value, { req }) => {
      if (value !== req.body.new_password) {
        throw new Error('تأكيد كلمة المرور غير متطابق')
      }
      return true
    })
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

    const { current_password, new_password } = req.body

    await authService.changePassword(req.userId, current_password, new_password)

    res.json({
      success: true,
      message: 'تم تغيير كلمة المرور بنجاح'
    })
  } catch (error) {
    console.error('Change password route error:', error)
    res.status(400).json({
      error: 'Password change failed',
      message: error.message
    })
  }
})

export default router
