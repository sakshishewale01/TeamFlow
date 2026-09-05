import React from 'react';
import Spinner from './Spinner';

export const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  fullWidth = false,
  className = '',
  icon: Icon,
  iconPosition = 'left',
  onClick,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98] select-none';

  const sizeStyles = {
    xs: 'px-2.5 py-1 text-xs gap-1.5',
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-5 py-3 text-base gap-2.5',
  }[size] || 'px-4 py-2.5 text-sm gap-2';

  const variantStyles = {
    primary:
      'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/20 focus:ring-indigo-500 border border-transparent dark:bg-indigo-600 dark:hover:bg-indigo-500',
    secondary:
      'bg-slate-100 hover:bg-slate-200 text-slate-800 focus:ring-slate-400 border border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 dark:text-slate-200 dark:border-slate-700',
    outline:
      'bg-transparent hover:bg-slate-100 text-slate-700 border border-slate-300 focus:ring-indigo-500 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-800',
    ghost:
      'bg-transparent hover:bg-slate-100 text-slate-600 focus:ring-slate-400 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200',
    danger:
      'bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-600/20 focus:ring-rose-500 border border-transparent dark:bg-rose-600 dark:hover:bg-rose-500',
    dangerOutline:
      'bg-transparent hover:bg-rose-50 text-rose-600 border border-rose-200 focus:ring-rose-500 dark:text-rose-400 dark:border-rose-900/50 dark:hover:bg-rose-950/40',
  }[variant] || 'bg-indigo-600 hover:bg-indigo-700 text-white';

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${widthStyle} ${className}`}
      onClick={onClick}
      {...props}
    >
      {isLoading ? (
        <>
          <Spinner
            size={size === 'lg' ? 'md' : 'sm'}
            color={variant === 'primary' || variant === 'danger' ? 'text-white' : 'text-indigo-600 dark:text-indigo-400'}
          />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />}
          {children}
          {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0" />}
        </>
      )}
    </button>
  );
};

export default Button;
