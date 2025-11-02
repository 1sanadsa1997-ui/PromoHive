import React from 'react'

export const Alert = ({ className = '', variant = 'default', children, ...props }) => {
  const variants = {
    default: 'bg-white border-gray-200 text-gray-950 dark:bg-gray-950 dark:border-gray-800 dark:text-gray-50',
    destructive: 'border-red-500/50 text-red-900 dark:border-red-500 [&>svg]:text-red-900 dark:border-red-900/50 dark:text-red-50 dark:dark:border-red-900 dark:[&>svg]:text-red-50'
  }
  
  const classes = `relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-gray-950 dark:[&>svg]:text-gray-50 ${variants[variant]} ${className}`
  
  return (
    <div
      role="alert"
      className={classes}
      {...props}
    >
      {children}
    </div>
  )
}

export const AlertDescription = ({ className = '', children, ...props }) => {
  const classes = `text-sm [&_p]:leading-relaxed ${className}`
  
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  )
}
