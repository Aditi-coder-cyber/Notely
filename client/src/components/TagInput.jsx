import React, { useState } from 'react';
import { FiX, FiTag } from 'react-icons/fi';

const MAX_TAGS = 10;
const MAX_TAG_LENGTH = 30;

export default function TagInput({
  tags = [],
  onChange,
  maxTags = MAX_TAGS,
  disabled = false,
  className = '',
}) {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  const addTag = (rawTag) => {
    const trimmed = rawTag.trim().toLowerCase().replace(/^#/, '');

    if (!trimmed) return;

    if (trimmed.length > MAX_TAG_LENGTH) {
      setError(`Tag cannot exceed ${MAX_TAG_LENGTH} characters`);
      return;
    }

    if (tags.length >= maxTags) {
      setError(`Maximum ${maxTags} tags allowed`);
      return;
    }

    if (tags.some((t) => t.toLowerCase() === trimmed)) {
      setError('Tag already added');
      return;
    }

    setError('');
    onChange([...tags, trimmed]);
    setInputValue('');
  };

  const removeTag = (indexToRemove) => {
    if (disabled) return;
    onChange(tags.filter((_, index) => index !== indexToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags.length - 1);
    } else if (error) {
      setError('');
    }
  };

  const handleBlur = () => {
    if (inputValue.trim()) {
      addTag(inputValue);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Tags
        </label>
        <span className="text-xs text-slate-400 dark:text-slate-500">
          {tags.length}/{maxTags}
        </span>
      </div>

      <div
        className={`flex flex-wrap items-center gap-1.5 p-2 rounded-xl border bg-white dark:bg-slate-900 transition min-h-[44px] ${
          error
            ? 'border-red-500 ring-2 ring-red-500/20'
            : 'border-slate-300 dark:border-slate-700 focus-within:border-indigo-500 dark:focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-500/20 dark:focus-within:ring-indigo-400/20'
        } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
      >
        <span className="text-slate-400 pl-1 shrink-0">
          <FiTag className="w-3.5 h-3.5" />
        </span>

        {tags.map((tag, index) => (
          <span
            key={`${tag}-${index}`}
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200/60 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800/60"
          >
            <span>#{tag}</span>
            {!disabled && (
              <button
                type="button"
                onClick={() => removeTag(index)}
                aria-label={`Remove tag ${tag}`}
                className="text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-200 transition focus:outline-none"
              >
                <FiX className="w-3 h-3" />
              </button>
            )}
          </span>
        ))}

        {tags.length < maxTags && (
          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              if (error) setError('');
            }}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            disabled={disabled}
            placeholder={tags.length === 0 ? 'Type tag and press Enter or comma...' : 'Add more...'}
            className="flex-1 min-w-[120px] bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none px-1 py-0.5"
          />
        )}
      </div>

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
