const express = require('express');
const router = express.Router();
const noteController = require('../controllers/note.controller');
const authMiddleware = require('../middleware/auth');
const {
  noteIdValidator,
  createNoteValidator,
  updateNoteValidator,
  listNotesQueryValidator
} = require('../validators/note.validator');

// All note endpoints are protected and owner-scoped
router.use(authMiddleware);

router.get('/', listNotesQueryValidator, noteController.listNotes);
router.post('/', createNoteValidator, noteController.createNote);
router.get('/:id', noteIdValidator, noteController.getNote);
router.put('/:id', noteIdValidator, updateNoteValidator, noteController.updateNote);
router.patch('/:id/pin', noteIdValidator, noteController.togglePin);
router.patch('/:id/archive', noteIdValidator, noteController.toggleArchive);
router.patch('/:id/restore', noteIdValidator, noteController.restoreNote);
router.delete('/:id/permanent', noteIdValidator, noteController.permanentDelete);
router.delete('/:id', noteIdValidator, noteController.deleteNote);

module.exports = router;
