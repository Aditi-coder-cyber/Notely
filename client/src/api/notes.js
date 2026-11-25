import apiClient from './axios';

/**
 * Fetch notes with optional filtering, search, and pagination.
 * @param {Object} params { search, tag, color, archived, deleted, page, limit, sort }
 */
export async function getNotes(params = {}) {
  // Filter out undefined, null or empty string params
  const cleanParams = {};
  Object.keys(params).forEach((key) => {
    if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
      cleanParams[key] = params[key];
    }
  });

  const response = await apiClient.get('/notes', { params: cleanParams });
  return response.data;
}

/**
 * Get a single note by ID.
 * @param {string} id
 */
export async function getNote(id) {
  const response = await apiClient.get(`/notes/${id}`);
  return response.data;
}

/**
 * Create a new note.
 * @param {Object} data { title, content, tags, color }
 */
export async function createNote(data) {
  const response = await apiClient.post('/notes', data);
  return response.data;
}

/**
 * Update an existing note.
 * @param {string} id
 * @param {Object} data { title, content, tags, color }
 */
export async function updateNote(id, data) {
  const response = await apiClient.put(`/notes/${id}`, data);
  return response.data;
}

/**
 * Soft delete a note (moves to trash).
 * @param {string} id
 */
export async function deleteNote(id) {
  const response = await apiClient.delete(`/notes/${id}`);
  return response.data;
}

/**
 * Toggle pinned status for a note.
 * @param {string} id
 */
export async function togglePin(id) {
  const response = await apiClient.patch(`/notes/${id}/pin`);
  return response.data;
}

/**
 * Toggle archived status for a note.
 * @param {string} id
 */
export async function toggleArchive(id) {
  const response = await apiClient.patch(`/notes/${id}/archive`);
  return response.data;
}

/**
 * Restore a soft-deleted note from trash.
 * @param {string} id
 */
export async function restoreNote(id) {
  const response = await apiClient.patch(`/notes/${id}/restore`);
  return response.data;
}

/**
 * Permanently delete a note (cannot be undone, returns 204 No Content).
 * @param {string} id
 */
export async function permanentDelete(id) {
  const response = await apiClient.delete(`/notes/${id}/permanent`);
  return response.data;
}
