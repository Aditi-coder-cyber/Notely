import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiArchive,
  FiTrash2,
  FiRefreshCw,
  FiCornerUpLeft,
} from 'react-icons/fi';
import { BsPinAngleFill, BsPinAngle } from 'react-icons/bs';
import { formatDate, truncateText, getNoteColorClass } from '../utils/helpers';

export default function NoteCard({
  note,
  onPin,
  onArchive,
  onDelete,
  onRestore,
  onPermanentDelete,
  onTagClick,
  variant = 'active', // 'active' | 'archive' | 'trash'
}) {
  const navigate = useNavigate();

  const noteId = note._id || note.id;
  const isPinned = Boolean(note.isPinned ?? note.pinned);
  const isArchived = Boolean(note.isArchived ?? note.archived);
  const isDeleted = Boolean(note.isDeleted ?? note.deleted);
  const colorClass = getNoteColorClass(note.color);

  const handleCardClick = (e) => {
    // In trash view, prevent navigating to editor
    if (variant === 'trash' || isDeleted) return;
    navigate(`/notes/${noteId}`);
  };

  return (
    <article
      onClick={handleCardClick}
      className={`group relative flex flex-col justify-between rounded-2xl border p-5 transition-all duration-200 ${colorClass} ${
        variant !== 'trash'
          ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5'
          : 'opacity-90'
      }`}
    >
      <div>
        {/* Header: Title & Pin/Action button */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-base text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {note.title || 'Untitled Note'}
          </h3>

          {variant === 'active' && onPin && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onPin(noteId);
              }}
              title={isPinned ? 'Unpin note' : 'Pin note'}
              aria-label={isPinned ? 'Unpin note' : 'Pin note'}
              className={`p-1.5 rounded-lg transition-colors shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                isPinned
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 opacity-0 group-hover:opacity-100 focus:opacity-100'
              }`}
            >
              {isPinned ? <BsPinAngleFill className="w-4 h-4" /> : <BsPinAngle className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Content Preview */}
        <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-4 whitespace-pre-line leading-relaxed mb-4">
          {truncateText(note.content, 200) || (
            <span className="italic text-slate-400 dark:text-slate-500">No content</span>
          )}
        </p>

        {/* Tags */}
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {note.tags.map((tag) => (
              <span
                key={tag}
                onClick={(e) => {
                  if (onTagClick) {
                    e.stopPropagation();
                    onTagClick(tag);
                  }
                }}
                className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/10 text-slate-700 dark:text-slate-300 transition ${
                  onTagClick ? 'hover:bg-indigo-100 dark:hover:bg-indigo-900/40 hover:text-indigo-700 dark:hover:text-indigo-300' : ''
                }`}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer: Date and Action Buttons */}
      <div className="pt-3 border-t border-black/5 dark:border-white/10 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>{formatDate(note.updatedAt || note.createdAt)}</span>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
          {variant === 'active' && (
            <>
              {onArchive && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onArchive(noteId);
                  }}
                  title={isArchived ? 'Unarchive' : 'Archive'}
                  aria-label={isArchived ? 'Unarchive' : 'Archive'}
                  className="p-1.5 rounded-md text-slate-500 hover:text-indigo-600 hover:bg-black/5 dark:hover:bg-white/10 transition"
                >
                  <FiArchive className="w-3.5 h-3.5" />
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(noteId);
                  }}
                  title="Move to trash"
                  aria-label="Move to trash"
                  className="p-1.5 rounded-md text-slate-500 hover:text-red-600 hover:bg-black/5 dark:hover:bg-white/10 transition"
                >
                  <FiTrash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </>
          )}

          {variant === 'archive' && (
            <>
              {onArchive && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onArchive(noteId);
                  }}
                  title="Unarchive note"
                  aria-label="Unarchive note"
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition"
                >
                  <FiCornerUpLeft className="w-3.5 h-3.5" />
                  <span>Unarchive</span>
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(noteId);
                  }}
                  title="Move to trash"
                  aria-label="Move to trash"
                  className="p-1.5 rounded-md text-slate-500 hover:text-red-600 hover:bg-black/5 dark:hover:bg-white/10 transition"
                >
                  <FiTrash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </>
          )}

          {variant === 'trash' && (
            <>
              {onRestore && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRestore(noteId);
                  }}
                  title="Restore note"
                  aria-label="Restore note"
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition"
                >
                  <FiRefreshCw className="w-3.5 h-3.5" />
                  <span>Restore</span>
                </button>
              )}
              {onPermanentDelete && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPermanentDelete(noteId);
                  }}
                  title="Delete permanently"
                  aria-label="Delete permanently"
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                >
                  <FiTrash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </article>
  );
}
