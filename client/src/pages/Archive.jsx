import React, { useState, useEffect, useCallback } from 'react';
import { FiArchive, FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';
import * as notesApi from '../api/notes';
import NoteCard from '../components/NoteCard';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';

export default function Archive() {
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 1,
  });

  const fetchArchivedNotes = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await notesApi.getNotes({
        archived: true,
        deleted: false,
        search: searchQuery || undefined,
        page: currentPage,
        limit: 12,
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
      console.error('Failed to load archived notes:', err);
      toast.error('Failed to load archived notes');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, currentPage]);

  useEffect(() => {
    fetchArchivedNotes();
  }, [fetchArchivedNotes]);

  const handleUnarchive = async (id) => {
    try {
      await notesApi.toggleArchive(id);
      setNotes((prev) => prev.filter((n) => (n._id || n.id) !== id));
      toast.success('Note unarchived and returned to workspace');
    } catch (err) {
      toast.error('Failed to unarchive note');
    }
  };

  const handleDelete = async (id) => {
    try {
      await notesApi.deleteNote(id);
      setNotes((prev) => prev.filter((n) => (n._id || n.id) !== id));
      toast.success('Note moved to trash');
    } catch (err) {
      toast.error('Failed to move note to trash');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Archived Notes
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Completed or reference notes stored away from your active workspace
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-md">
        <SearchBar
          value={searchQuery}
          onSearch={(query) => {
            setSearchQuery(query);
            setCurrentPage(1);
          }}
          placeholder="Search archived notes..."
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <Spinner size="lg" />
          <p className="mt-3 text-sm text-slate-400">Loading archived notes...</p>
        </div>
      ) : notes.length === 0 ? (
        <EmptyState
          icon={<FiArchive className="w-7 h-7" />}
          title={searchQuery ? 'No matching archived notes' : 'No archived notes'}
          description={
            searchQuery
              ? 'No archived notes matched your search query.'
              : 'Archive notes you want to keep for reference without cluttering your main workspace.'
          }
        />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {notes.map((note) => (
              <NoteCard
                key={note._id || note.id}
                note={note}
                onArchive={handleUnarchive}
                onDelete={handleDelete}
                variant="archive"
              />
            ))}
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.pages}
              totalItems={pagination.total}
              onPageChange={(p) => setCurrentPage(p)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
