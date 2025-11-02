import React from 'react'
import { useTranslation } from 'react-i18next'

const LoadingSpinner = ({ size = 'default', message }) => {
  const { t } = useTranslation()
  
  const sizeClasses = {
    small: 'w-4 h-4',
    default: 'w-8 h-8',
    large: 'w-12 h-12'
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center space-y-4">
        {/* Spinner */}
        <div className={`${sizeClasses[size]} animate-spin`}>
          <svg 
            className="w-full h-full text-blue-600" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
        
        {/* Loading message */}
        <div className="text-center">
          <p className="text-lg font-medium text-gray-900 dark:text-white">
            {message || t('common.loading')}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('common.please_wait')}
          </p>
        </div>
        
        {/* Logo or branding */}
        <div className="mt-8 text-center">
          <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            نظام إبراهيم للمحاسبة
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Ibrahim Accounting System
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoadingSpinner
