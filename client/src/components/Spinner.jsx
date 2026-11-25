import React from 'react';

export default function Spinner({ size = 'md', className = '', label = 'Loading...' }) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
    xl: 'w-12 h-12 border-4',
  };

  return (
    <div className={`flex items-center justify-center ${className}`} role="status" aria-label={label}>
      <div
        className={`${sizeClasses[size] || sizeClasses.md} rounded-full border-slate-300 dark:border-slate-700 border-t-indigo-600 dark:border-t-indigo-400 animate-spin`}
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}
