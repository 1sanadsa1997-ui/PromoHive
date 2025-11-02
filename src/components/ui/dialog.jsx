import React from 'react'

export const Dialog = ({ open, onOpenChange, children }) => {
  if (!open) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/50" 
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-50">
        {children}
      </div>
    </div>
  )
}

export const DialogContent = ({ className = '', children, ...props }) => {
  const classes = `fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-gray-200 bg-white p-6 shadow-lg duration-200 sm:rounded-lg dark:border-gray-800 dark:bg-gray-950 ${className}`
  
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  )
}

export const DialogHeader = ({ className = '', children, ...props }) => {
  const classes = `flex flex-col space-y-1.5 text-center sm:text-left ${className}`
  
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  )
}

export const DialogTitle = ({ className = '', children, ...props }) => {
  const classes = `text-lg font-semibold leading-none tracking-tight ${className}`
  
  return (
    <h2 className={classes} {...props}>
      {children}
    </h2>
  )
}

export const DialogDescription = ({ className = '', children, ...props }) => {
  const classes = `text-sm text-gray-500 dark:text-gray-400 ${className}`
  
  return (
    <p className={classes} {...props}>
      {children}
    </p>
  )
}

export const DialogFooter = ({ className = '', children, ...props }) => {
  const classes = `flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 ${className}`
  
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  )
}
