const mongoose = require('mongoose');

const ALLOWED_COLORS = ['default', 'yellow', 'blue', 'green', 'pink', 'purple'];

const noteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [1, 'Title must be at least 1 character long'],
      maxlength: [160, 'Title cannot exceed 160 characters']
    },
    content: {
      type: String,
      default: '',
      maxlength: [100000, 'Content cannot exceed 100000 characters']
    },
    tags: {
      type: [
        {
          type: String,
          trim: true,
          maxlength: [30, 'Tag cannot exceed 30 characters']
        }
      ],
      validate: [
        (val) => Array.isArray(val) && val.length <= 10,
        'Tags cannot exceed 10 items'
      ],
      default: []
    },
    color: {
      type: String,
      enum: {
        values: ALLOWED_COLORS,
        message: '{VALUE} is not a valid color'
      },
      default: 'default'
    },
    isPinned: {
      type: Boolean,
      default: false
    },
    isArchived: {
      type: Boolean,
      default: false
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Compound index for optimized querying and sorting
noteSchema.index({ userId: 1, isDeleted: 1, isArchived: 1, updatedAt: -1 });

const Note = mongoose.model('Note', noteSchema);

module.exports = Note;
