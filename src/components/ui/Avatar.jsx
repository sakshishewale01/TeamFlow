import React, { useState } from 'react';

export const Avatar = ({
  src,
  alt = 'Avatar',
  name = '',
  size = 'md',
  className = '',
  statusIndicator,
}) => {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base font-semibold',
    xl: 'w-20 h-20 text-xl font-bold',
    '2xl': 'w-28 h-28 text-2xl font-bold',
  }[size] || 'w-10 h-10 text-sm';

  const getInitials = (text) => {
    if (!text || !text.trim()) return 'TF';
    const parts = text.trim().split(' ').filter(Boolean);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getDeterministicColor = (text) => {
    const colors = [
      'bg-indigo-600 text-white',
      'bg-blue-600 text-white',
      'bg-violet-600 text-white',
      'bg-rose-600 text-white',
      'bg-amber-600 text-white',
      'bg-emerald-600 text-white',
      'bg-teal-600 text-white',
    ];
    if (!text) return colors[0];
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const showFallback = !src || imageError;
  const initials = getInitials(name || alt);
  const colorClass = getDeterministicColor(name || alt);

  return (
    <div className={`relative inline-block select-none shrink-0 ${className}`}>
      {showFallback ? (
        <div
          className={`${sizeClasses} ${colorClass} rounded-full flex items-center justify-center font-medium shadow-inner tracking-wider border-2 border-white dark:border-slate-800`}
        >
          {initials}
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          onError={() => setImageError(true)}
          className={`${sizeClasses} rounded-full object-cover border-2 border-white dark:border-slate-800 shadow-sm`}
        />
      )}
      {statusIndicator && (
        <span className="absolute bottom-0 right-0 block w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-slate-900 bg-emerald-500" />
      )}
    </div>
  );
};

export default Avatar;
