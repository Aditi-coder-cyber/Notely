import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiPlus,
  FiFilter,
  FiX,
  FiBookOpen,
  FiSearch,
} from 'react-icons/fi';
import { BsPinAngleFill } from 'react-icons/bs';
import toast from 'react-hot-toast';
import * as notesApi from '../api/notes';
import NoteCard from '../components/NoteCard';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import Button from '../components/Button';
import { NOTE_COLOR_SWATCHES } from '../utils/helpers';

export default function NotesWorkspace() {
  const navigate = useNavigate();

  // State
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 1,
  });

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [sortBy, setSortBy] = useState('updatedAt:desc');
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch notes from backend
  const fetchNotes = useCallback(async () => {
    setIsLoading(true);
    try {
      // Server only accepts sort field name ('updatedAt' or 'createdAt'),
      // so strip any ':asc'/':desc' suffix before sending.
      const sortField = sortBy.includes(':') ? sortBy.split(':')[0] : sortBy;

      const response = await notesApi.getNotes({
        search: searchQuery || undefined,
        tag: selectedTag || undefined,
        color: selectedColor || undefined,
        archived: false,
        deleted: false,
        page: currentPage,
        limit: 12,
        sort: sortField || undefined,
      });

      if (response && response.success) {
        const fetchedNotes = Array.isArray(response.data)
          ? response.data
          : response.data?.notes || [];
        const fetchedPagination = response.data?.pagination || {
          page: currentPage,
          limit: 12,
          total: fetchedNotes.length,
          pages: 1,
        };

        setNotes(fetchedNotes);
        setPagination(fetchedPagination);
      }
    } catch (err) {
      console.error('Failed to load notes:', err);
      toast.error('Failed to load notes');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedTag, selectedColor, sortBy, currentPage]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // Handlers
  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleTagClick = (tag) => {
    setSelectedTag((prev) => (prev === tag ? '' : tag));
    setCurrentPage(1);
  };

  const handleColorClick = (colorId) => {
    setSelectedColor((prev) => (prev === colorId ? '' : colorId));
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedTag('');
    setSelectedColor('');
    setSortBy('updatedAt:desc');
    setCurrentPage(1);
  };

  const handleTogglePin = async (id) => {
    try {
      await notesApi.togglePin(id);
      // Optimistic update
      setNotes((prev) =>
        prev.map((n) => {
          if ((n._id || n.id) === id) {
            const currentPin = Boolean(n.isPinned ?? n.pinned);
            return { ...n, isPinned: !currentPin, pinned: !currentPin };
          }
          return n;
        })
      );
      toast.success('Note pin updated');
    } catch (err) {
      toast.error('Failed to update note pin');
      fetchNotes();
    }
  };

  const handleArchive = async (id) => {
    try {
      await notesApi.toggleArchive(id);
      setNotes((prev) => prev.filter((n) => (n._id || n.id) !== id));
      toast.success('Note archived');
    } catch (err) {
      toast.error('Failed to archive note');
    }
  };

  const handleDelete = async (id) => {
    try {
      await notesApi.deleteNote(id);
      setNotes((prev) => prev.filter((n) => (n._id || n.id) !== id));
      toast.success('Moved to trash');
    } catch (err) {
      toast.error('Failed to delete note');
    }
  };

  // Split into pinned and other notes
  const pinnedNotes = notes.filter((n) => Boolean(n.isPinned ?? n.pinned));
  const otherNotes = notes.filter((n) => !Boolean(n.isPinned ?? n.pinned));

  const hasActiveFilters = Boolean(searchQuery || selectedTag || selectedColor);

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Notes Workspace
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Organize, draft, and browse your personal knowledge base
          </p>
        </div>

        <Button
          onClick={() => navigate('/notes/new')}
          leftIcon={<FiPlus className="w-4 h-4" />}
          className="shrink-0"
        >
          New Note
        </Button>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex-1">
          <SearchBar
            value={searchQuery}
            onSearch={handleSearch}
            placeholder="Search titles, markdown content, tags..."
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Color Filter Swatches */}
          <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mr-1 hidden sm:inline">
              Color:
            </span>
            {NOTE_COLOR_SWATCHES.map((swatch) => {
              const isSelected = selectedColor === swatch.id;
              return (
                <button
                  key={swatch.id}
                  type="button"
                  onClick={() => handleColorClick(swatch.id)}
                  title={`Filter by ${swatch.label}`}
                  className={`w-5 h-5 rounded-full transition-transform hover:scale-110 border ${
                    swatch.bgClass
                  } ${swatch.borderClass} ${
                    isSelected ? 'ring-2 ring-indigo-600 dark:ring-indigo-400 ring-offset-1' : ''
                  }`}
                />
              );
            })}
          </div>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Sort notes"
            className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 py-2 px-3 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="updatedAt:desc">Recently Updated</option>
            <option value="createdAt:desc">Recently Created</option>
            <option value="createdAt:asc">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Active filters:
          </span>

          {searchQuery && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              Query: "{searchQuery}"
              <button
                type="button"
                onClick={() => handleSearch('')}
                className="hover:text-red-500 ml-1"
                aria-label="Clear query filter"
              >
                <FiX className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedTag && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50">
              Tag: #{selectedTag}
              <button
                type="button"
                onClick={() => setSelectedTag('')}
                className="hover:text-red-500 ml-1"
                aria-label="Clear tag filter"
              >
                <FiX className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedColor && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              Color: {selectedColor}
              <button
                type="button"
                onClick={() => setSelectedColor('')}
                className="hover:text-red-500 ml-1"
                aria-label="Clear color filter"
              >
                <FiX className="w-3 h-3" />
              </button>
            </span>
          )}

          <button
            type="button"
            onClick={clearAllFilters}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline ml-1 font-medium"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Notes Content */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <Spinner size="lg" />
          <p className="mt-3 text-sm text-slate-400">Loading notes...</p>
        </div>
      ) : notes.length === 0 ? (
        hasActiveFilters ? (
          <EmptyState
            icon={<FiSearch className="w-7 h-7" />}
            title="No matching notes found"
            description="We couldn't find any notes matching your active filters. Try adjusting your search term or clearing filters."
            actionLabel="Reset Filters"
            onAction={clearAllFilters}
          />
        ) : (
          <EmptyState
            icon={<FiBookOpen className="w-7 h-7" />}
            title="Your knowledge base is empty"
            description="Create your first note to start organizing thoughts, documentation, code snippets, or project roadmaps."
            actionLabel="Create First Note"
            actionIcon={<FiPlus />}
            onAction={() => navigate('/notes/new')}
          />
        )
      ) : (
        <div className="space-y-8">
          {/* Pinned Notes Section */}
          {pinnedNotes.length > 0 && (
            <section aria-labelledby="pinned-heading">
              <div className="flex items-center gap-2 mb-3 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                <BsPinAngleFill className="w-3.5 h-3.5" />
                <h2 id="pinned-heading">Pinned Notes ({pinnedNotes.length})</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {pinnedNotes.map((note) => (
                  <NoteCard
                    key={note._id || note.id}
                    note={note}
                    onPin={handleTogglePin}
                    onArchive={handleArchive}
                    onDelete={handleDelete}
                    onTagClick={handleTagClick}
                    variant="active"
                  />
                ))}
              </div>
            </section>
          )}

          {/* Other / Unpinned Notes Section */}
          {otherNotes.length > 0 && (
            <section aria-labelledby="all-notes-heading">
              {pinnedNotes.length > 0 && (
                <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <h2 id="all-notes-heading">Other Notes ({otherNotes.length})</h2>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {otherNotes.map((note) => (
                  <NoteCard
                    key={note._id || note.id}
                    note={note}
                    onPin={handleTogglePin}
                    onArchive={handleArchive}
                    onDelete={handleDelete}
                    onTagClick={handleTagClick}
                    variant="active"
                  />
                ))}
              </div>
            </section>
          )}

          {/* Pagination */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.pages}
              totalItems={pagination.total}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
