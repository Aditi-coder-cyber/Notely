import React, { useState, useEffect, useCallback } from 'react';
import { FiTrash2, FiRefreshCw, FiAlertTriangle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import * as notesApi from '../api/notes';
import NoteCard from '../components/NoteCard';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import Button from '../components/Button';

export default function Trash() {
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

  // Modal dialog states
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [isDeletingPermanently, setIsDeletingPermanently] = useState(false);

  const fetchTrashNotes = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await notesApi.getNotes({
        deleted: true,
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
      console.error('Failed to load trash notes:', err);
      toast.error('Failed to load trash notes');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, currentPage]);

  useEffect(() => {
    fetchTrashNotes();
  }, [fetchTrashNotes]);

  const handleRestore = async (id) => {
    try {
      await notesApi.restoreNote(id);
      setNotes((prev) => prev.filter((n) => (n._id || n.id) !== id));
      toast.success('Note restored to active workspace');
    } catch (err) {
      toast.error('Failed to restore note');
    }
  };

  const handleOpenPermanentDeleteDialog = (id) => {
    setSelectedNoteId(id);
    setConfirmDialogOpen(true);
  };

  const handlePermanentDelete = async () => {
    if (!selectedNoteId) return;
    setIsDeletingPermanently(true);

    try {
      await notesApi.permanentDelete(selectedNoteId);
      setNotes((prev) => prev.filter((n) => (n._id || n.id) !== selectedNoteId));
      toast.success('Note permanently deleted');
    } catch (err) {
      toast.error('Failed to permanently delete note');
    } finally {
      setIsDeletingPermanently(false);
      setConfirmDialogOpen(false);
      setSelectedNoteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Trash
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Notes in trash can be restored or permanently removed
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-md">
        <SearchBar
          value={searchQuery}
          onSearch={(query) => {
            setSearchQuery(query);
            setCurrentPage(1);
          }}
          placeholder="Search deleted notes..."
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <Spinner size="lg" />
          <p className="mt-3 text-sm text-slate-400">Loading trash...</p>
        </div>
      ) : notes.length === 0 ? (
        <EmptyState
          icon={<FiTrash2 className="w-7 h-7" />}
          title={searchQuery ? 'No matching notes in trash' : 'Trash is empty'}
          description={
            searchQuery
              ? 'No deleted notes matched your search query.'
              : 'Deleted notes will appear here. You can safely restore them anytime.'
          }
        />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {notes.map((note) => (
              <NoteCard
                key={note._id || note.id}
                note={note}
                onRestore={handleRestore}
                onPermanentDelete={handleOpenPermanentDeleteDialog}
                variant="trash"
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

      {/* Permanent Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialogOpen}
        title="Permanently delete note?"
        message="This action cannot be undone. All content and metadata for this note will be erased forever."
        confirmText="Delete Forever"
        variant="danger"
        isLoading={isDeletingPermanently}
        onConfirm={handlePermanentDelete}
        onCancel={() => {
          setConfirmDialogOpen(false);
          setSelectedNoteId(null);
        }}
      />
    </div>
  );
}
