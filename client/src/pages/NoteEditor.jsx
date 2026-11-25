import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiSave,
  FiTrash2,
  FiArchive,
  FiEye,
  FiEdit2,
  FiColumns,
} from 'react-icons/fi';
import { BsPinAngleFill, BsPinAngle } from 'react-icons/bs';
import toast from 'react-hot-toast';
import * as notesApi from '../api/notes';
import MarkdownPreview from '../components/MarkdownPreview';
import TagInput from '../components/TagInput';
import ColorPicker from '../components/ColorPicker';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import ConfirmDialog from '../components/ConfirmDialog';
import { getNoteColorClass } from '../utils/helpers';

export default function NoteEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [color, setColor] = useState('default');
  const [isPinned, setIsPinned] = useState(false);
  const [isArchived, setIsArchived] = useState(false);

  // View & UI state
  const [editorMode, setEditorMode] = useState('write'); // 'write' | 'preview' | 'split'
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load note data if editing
  useEffect(() => {
    if (!isEditing) return;

    let isMounted = true;
    const fetchNote = async () => {
      setIsLoading(true);
      try {
        const response = await notesApi.getNote(id);
        if (response && response.success && isMounted) {
          const noteData = response.data?.note || response.data;
          setTitle(noteData.title || '');
          setContent(noteData.content || '');
          setTags(Array.isArray(noteData.tags) ? noteData.tags : []);
          setColor(noteData.color || 'default');
          setIsPinned(Boolean(noteData.isPinned ?? noteData.pinned));
          setIsArchived(Boolean(noteData.isArchived ?? noteData.archived));
        }
      } catch (err) {
        console.error('Failed to fetch note:', err);
        toast.error('Note could not be found or loaded');
        navigate('/notes');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchNote();

    return () => {
      isMounted = false;
    };
  }, [id, isEditing, navigate]);

  const handleSave = async (e) => {
    if (e) e.preventDefault();

    if (!title.trim() && !content.trim()) {
      toast.error('Please enter a title or some content for the note');
      return;
    }

    setIsSaving(true);
    const payload = {
      title: title.trim(),
      content,
      tags,
      color,
    };

    try {
      if (isEditing) {
        await notesApi.updateNote(id, payload);
        toast.success('Note updated successfully');
      } else {
        const res = await notesApi.createNote(payload);
        // If user toggled pin during creation, pin it
        const newNoteId = res?.data?._id || res?.data?.id || res?.data?.note?._id;
        if (isPinned && newNoteId) {
          await notesApi.togglePin(newNoteId);
        }
        toast.success('Note created successfully');
      }
      navigate('/notes');
    } catch (err) {
      console.error('Save failed:', err);
      const msg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        'Failed to save note';
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePin = async () => {
    if (isEditing) {
      try {
        await notesApi.togglePin(id);
        setIsPinned(!isPinned);
        toast.success(isPinned ? 'Note unpinned' : 'Note pinned to top');
      } catch (err) {
        toast.error('Failed to update pin');
      }
    } else {
      setIsPinned(!isPinned);
    }
  };

  const handleToggleArchive = async () => {
    if (!isEditing) return;
    try {
      await notesApi.toggleArchive(id);
      setIsArchived(!isArchived);
      toast.success(isArchived ? 'Note unarchived' : 'Note moved to archive');
      navigate('/notes');
    } catch (err) {
      toast.error('Failed to update archive status');
    }
  };

  const handleDelete = async () => {
    if (!isEditing) return;
    setIsDeleting(true);
    try {
      await notesApi.deleteNote(id);
      toast.success('Note moved to trash');
      navigate('/notes');
    } catch (err) {
      toast.error('Failed to move note to trash');
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center">
        <Spinner size="lg" />
        <p className="mt-3 text-sm text-slate-400">Loading note details...</p>
      </div>
    );
  }

  const containerColorClass = getNoteColorClass(color);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition"
        >
          <FiArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Pin toggle button */}
          <button
            type="button"
            onClick={handleTogglePin}
            title={isPinned ? 'Unpin note' : 'Pin note'}
            className={`p-2.5 rounded-xl border transition ${
              isPinned
                ? 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-950/60 dark:border-indigo-800 dark:text-indigo-400'
                : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {isPinned ? <BsPinAngleFill className="w-4 h-4" /> : <BsPinAngle className="w-4 h-4" />}
          </button>

          {/* Archive toggle button (edit only) */}
          {isEditing && (
            <button
              type="button"
              onClick={handleToggleArchive}
              title={isArchived ? 'Unarchive note' : 'Archive note'}
              className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <FiArchive className="w-4 h-4" />
            </button>
          )}

          {/* Delete button (edit only) */}
          {isEditing && (
            <button
              type="button"
              onClick={() => setDeleteDialogOpen(true)}
              title="Move to trash"
              className="p-2.5 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          )}

          <Button
            onClick={handleSave}
            isLoading={isSaving}
            leftIcon={<FiSave className="w-4 h-4" />}
          >
            {isEditing ? 'Save Changes' : 'Create Note'}
          </Button>
        </div>
      </div>

      {/* Editor Main Container */}
      <div
        className={`rounded-2xl border p-6 sm:p-8 shadow-sm transition-colors duration-200 ${containerColorClass}`}
      >
        {/* Title Input */}
        <div className="mb-6">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title..."
            autoFocus={!isEditing}
            className="w-full text-2xl sm:text-3xl font-bold bg-transparent border-0 border-b border-transparent hover:border-slate-300/50 dark:hover:border-slate-700/50 focus:border-indigo-500 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 pb-2 focus:outline-none transition"
          />
        </div>

        {/* View mode toggle tabs */}
        <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/10 mb-4">
          <div className="inline-flex p-1 rounded-xl bg-black/5 dark:bg-white/5 text-xs font-medium">
            <button
              type="button"
              onClick={() => setEditorMode('write')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                editorMode === 'write'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <FiEdit2 className="w-3.5 h-3.5" />
              <span>Write</span>
            </button>
            <button
              type="button"
              onClick={() => setEditorMode('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                editorMode === 'preview'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <FiEye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
            <button
              type="button"
              onClick={() => setEditorMode('split')}
              className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                editorMode === 'split'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <FiColumns className="w-3.5 h-3.5" />
              <span>Split</span>
            </button>
          </div>

          <span className="text-xs text-slate-400 dark:text-slate-500">
            Supports Markdown formatting
          </span>
        </div>

        {/* Content Area */}
        <div className="min-h-[300px]">
          {editorMode === 'write' && (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your thoughts, ideas, or documentation in markdown..."
              rows={16}
              className="w-full bg-transparent border-0 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none resize-y leading-relaxed font-mono text-sm sm:text-base"
            />
          )}

          {editorMode === 'preview' && (
            <div className="min-h-[350px] p-2">
              <MarkdownPreview content={content} />
            </div>
          )}

          {editorMode === 'split' && (
            <div className="grid grid-cols-2 gap-6 min-h-[350px]">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write markdown here..."
                rows={16}
                className="w-full bg-transparent border-0 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none resize-y leading-relaxed font-mono text-sm border-r border-black/5 dark:border-white/10 pr-4"
              />
              <div className="overflow-y-auto max-h-[500px] pl-2">
                <MarkdownPreview content={content} />
              </div>
            </div>
          )}
        </div>

        {/* Note Metadata: Color and Tags */}
        <div className="mt-8 pt-6 border-t border-black/5 dark:border-white/10 grid grid-cols-1 md:grid-cols-2 gap-6">
          <ColorPicker selectedColor={color} onChange={setColor} />
          <TagInput tags={tags} onChange={setTags} />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        title="Move note to trash?"
        message="This note will be moved to the trash folder. You can restore it anytime or delete it permanently from the Trash tab."
        confirmText="Move to Trash"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </div>
  );
}
