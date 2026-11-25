/**
 * Format date string into a friendly, human-readable format.
 * Examples: "Just now", "5m ago", "Today at 2:30 PM", "Yesterday", or "Oct 24, 2026"
 */
export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';

  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

/**
 * Truncate text to a maximum length with ellipsis.
 */
export function truncateText(text, maxLength = 120) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

/**
 * Generate 1-2 letter initials from a user's full name.
 */
export function getInitials(name) {
  if (!name || typeof name !== 'string') return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Color mapping for note cards and editor backgrounds.
 */
export const NOTE_COLOR_MAP = {
  default: 'bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-700',
  yellow: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800/40',
  blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/40',
  green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/40',
  pink: 'bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800/40',
  purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800/40',
};

/**
 * Accent colors for picker dots & badges
 */
export const NOTE_COLOR_SWATCHES = [
  { id: 'default', label: 'Default', bgClass: 'bg-slate-200 dark:bg-slate-700', borderClass: 'border-slate-300 dark:border-slate-600' },
  { id: 'yellow', label: 'Yellow', bgClass: 'bg-amber-300 dark:bg-amber-500', borderClass: 'border-amber-400 dark:border-amber-600' },
  { id: 'blue', label: 'Blue', bgClass: 'bg-sky-300 dark:bg-sky-500', borderClass: 'border-sky-400 dark:border-sky-600' },
  { id: 'green', label: 'Green', bgClass: 'bg-emerald-300 dark:bg-emerald-500', borderClass: 'border-emerald-400 dark:border-emerald-600' },
  { id: 'pink', label: 'Pink', bgClass: 'bg-rose-300 dark:bg-rose-500', borderClass: 'border-rose-400 dark:border-rose-600' },
  { id: 'purple', label: 'Purple', bgClass: 'bg-purple-300 dark:bg-purple-500', borderClass: 'border-purple-400 dark:border-purple-600' },
];

/**
 * Returns the card background & border CSS classes for a given note color.
 */
export function getNoteColorClass(color) {
  return NOTE_COLOR_MAP[color] || NOTE_COLOR_MAP.default;
}

/**
 * Escape special regex characters in user search query string.
 */
export function escapeRegex(string) {
  if (!string || typeof string !== 'string') return '';
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
