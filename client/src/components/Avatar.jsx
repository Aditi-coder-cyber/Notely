import React, { useState } from 'react';
import { getInitials } from '../utils/helpers';

export default function Avatar({ src, name = '', size = 'md', className = '' }) {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  const initials = getInitials(name);

  // Derive a consistent pastel background color based on name initials
  const bgColors = [
    'bg-indigo-600 text-white',
    'bg-emerald-600 text-white',
    'bg-violet-600 text-white',
    'bg-rose-600 text-white',
    'bg-amber-600 text-white',
    'bg-sky-600 text-white',
  ];
  const charCode = name ? name.charCodeAt(0) + (name.charCodeAt(name.length - 1) || 0) : 0;
  const colorClass = bgColors[charCode % bgColors.length];

  if (src && !imageError) {
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        onError={() => setImageError(true)}
        className={`${sizeClasses[size] || sizeClasses.md} rounded-full object-cover shrink-0 ring-2 ring-white dark:ring-slate-800 ${className}`}
      />
    );
  }

  return (
    <div
      aria-label={name || 'Avatar'}
      className={`${sizeClasses[size] || sizeClasses.md} rounded-full flex items-center justify-center font-semibold uppercase shrink-0 select-none shadow-xs ${colorClass} ${className}`}
    >
      {initials}
    </div>
  );
}
