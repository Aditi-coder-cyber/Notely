import React from 'react';
import { FiCheck } from 'react-icons/fi';
import { NOTE_COLOR_SWATCHES } from '../utils/helpers';

export default function ColorPicker({
  selectedColor = 'default',
  onChange,
  disabled = false,
  className = '',
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
        Color Accent
      </span>
      <div className="flex items-center gap-2.5 flex-wrap" role="radiogroup" aria-label="Select note color">
        {NOTE_COLOR_SWATCHES.map((swatch) => {
          const isSelected = selectedColor === swatch.id;

          return (
            <button
              key={swatch.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={`${swatch.label} color`}
              title={swatch.label}
              disabled={disabled}
              onClick={() => onChange(swatch.id)}
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-all transform hover:scale-110 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 border ${
                swatch.bgClass
              } ${swatch.borderClass} ${
                isSelected
                  ? 'ring-2 ring-indigo-600 dark:ring-indigo-400 ring-offset-2 dark:ring-offset-slate-900 shadow-sm'
                  : ''
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSelected && (
                <FiCheck className="w-3.5 h-3.5 text-slate-800 dark:text-slate-200" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
