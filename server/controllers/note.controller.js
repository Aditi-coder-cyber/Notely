const Note = require('../models/Note');
const ApiError = require('../utils/ApiError');
const { ALLOWED_COLORS } = require('../validators/note.validator');

// Utility to escape regex special characters to prevent ReDoS
const escapeRegex = (string) => {
  return string.replace(/[-.*+?^${}()|[\]\\\/]/g, '\\$&');
};

const createNote = async (req, res, next) => {
  try {
    const { title, content, color } = req.body;
    const tags = Array.isArray(req.body.tags)
      ? req.body.tags.map((t) => t.trim().toLowerCase()).filter(Boolean)
      : [];

    const note = await Note.create({
      userId: req.user.id,
      title: title.trim(),
      content: content !== undefined ? content : '',
      tags,
      color: color || 'default',
      isPinned: false,
      isArchived: false,
      isDeleted: false
    });

    return res.status(201).json({
      success: true,
      data: { note },
      message: 'Note created successfully'
    });
  } catch (error) {
    next(error);
  }
};

const listNotes = async (req, res, next) => {
  try {
    const isDeleted = req.query.deleted === 'true';
    const filter = {
      userId: req.user.id,
      isDeleted
    };

    if (req.query.archived !== undefined) {
      filter.isArchived = req.query.archived === 'true';
    } else if (!isDeleted) {
      filter.isArchived = false;
    }

    if (req.query.search && req.query.search.trim()) {
      const sanitized = escapeRegex(req.query.search.trim());
      filter.$or = [
        { title: { $regex: sanitized, $options: 'i' } },
        { content: { $regex: sanitized, $options: 'i' } }
      ];
    }

    if (req.query.tag && req.query.tag.trim()) {
      filter.tags = req.query.tag.trim().toLowerCase();
    }

    if (req.query.color && ALLOWED_COLORS.includes(req.query.color)) {
      filter.color = req.query.color;
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 50);
    const skip = (page - 1) * limit;

    const sortField = ['updatedAt', 'createdAt'].includes(req.query.sort)
      ? req.query.sort
      : 'updatedAt';

    const sort = {};
    if (!isDeleted && !filter.isArchived) {
      sort.isPinned = -1;
    }
    sort[sortField] = -1;

    const [notes, total] = await Promise.all([
      Note.find(filter).sort(sort).skip(skip).limit(limit),
      Note.countDocuments(filter)
    ]);

    const pages = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      data: {
        notes,
        pagination: {
          page,
          limit,
          total,
          pages
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

const getNote = async (req, res, next) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user.id });
    if (!note) {
      return next(ApiError.notFound('Note not found'));
    }

    return res.status(200).json({
      success: true,
      data: { note },
      message: 'Note retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
};

const updateNote = async (req, res, next) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user.id });
    if (!note) {
      return next(ApiError.notFound('Note not found'));
    }

    if (req.body.title !== undefined) {
      note.title = req.body.title.trim();
    }
    if (req.body.content !== undefined) {
      note.content = req.body.content;
    }
    if (req.body.tags !== undefined) {
      note.tags = req.body.tags.map((t) => t.trim().toLowerCase()).filter(Boolean);
    }
    if (req.body.color !== undefined) {
      note.color = req.body.color;
    }
    if (req.body.isPinned !== undefined) {
      note.isPinned = req.body.isPinned;
    }
    if (req.body.isArchived !== undefined) {
      note.isArchived = req.body.isArchived;
    }

    await note.save();

    return res.status(200).json({
      success: true,
      data: { note },
      message: 'Note updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

const deleteNote = async (req, res, next) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user.id });
    if (!note) {
      return next(ApiError.notFound('Note not found'));
    }

    note.isDeleted = true;
    note.isPinned = false;
    await note.save();

    return res.status(200).json({
      success: true,
      data: { note },
      message: 'Note moved to trash successfully'
    });
  } catch (error) {
    next(error);
  }
};

const restoreNote = async (req, res, next) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user.id });
    if (!note) {
      return next(ApiError.notFound('Note not found'));
    }

    note.isDeleted = false;
    await note.save();

    return res.status(200).json({
      success: true,
      data: { note },
      message: 'Note restored successfully'
    });
  } catch (error) {
    next(error);
  }
};

const togglePin = async (req, res, next) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user.id });
    if (!note) {
      return next(ApiError.notFound('Note not found'));
    }

    note.isPinned = !note.isPinned;
    if (note.isPinned) {
      note.isArchived = false;
    }
    await note.save();

    return res.status(200).json({
      success: true,
      data: { note },
      message: note.isPinned ? 'Note pinned successfully' : 'Note unpinned successfully'
    });
  } catch (error) {
    next(error);
  }
};

const toggleArchive = async (req, res, next) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user.id });
    if (!note) {
      return next(ApiError.notFound('Note not found'));
    }

    note.isArchived = !note.isArchived;
    if (note.isArchived) {
      note.isPinned = false;
    }
    await note.save();

    return res.status(200).json({
      success: true,
      data: { note },
      message: note.isArchived ? 'Note archived successfully' : 'Note unarchived successfully'
    });
  } catch (error) {
    next(error);
  }
};

const permanentDelete = async (req, res, next) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user.id });
    if (!note || !note.isDeleted) {
      return next(ApiError.notFound('Note not found in trash'));
    }

    await Note.deleteOne({ _id: req.params.id, userId: req.user.id });

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createNote,
  listNotes,
  getNote,
  updateNote,
  deleteNote,
  restoreNote,
  togglePin,
  toggleArchive,
  permanentDelete
};
