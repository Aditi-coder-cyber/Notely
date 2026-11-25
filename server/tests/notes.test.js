const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Note = require('../models/Note');
const {
  connectTestDB,
  closeTestDB,
  clearTestDB,
  createTestUser,
  getAuthToken
} = require('./setup');

describe('Notes Endpoints', () => {
  let userA, tokenA;
  let userB, tokenB;

  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();

    const uA = await createTestUser({ email: 'usera@example.com', name: 'User A' });
    userA = uA.user;
    tokenA = getAuthToken(userA);

    const uB = await createTestUser({ email: 'userb@example.com', name: 'User B' });
    userB = uB.user;
    tokenB = getAuthToken(userB);
  });

  describe('POST /api/notes (Create Note)', () => {
    it('should create a new note with valid data', async () => {
      const res = await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          title: 'My First Note',
          content: 'This is the note content',
          tags: ['Mern', 'Project'],
          color: 'blue'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.note).toBeDefined();
      expect(res.body.data.note.title).toBe('My First Note');
      expect(res.body.data.note.content).toBe('This is the note content');
      expect(res.body.data.note.tags).toEqual(['mern', 'project']);
      expect(res.body.data.note.color).toBe('blue');
      expect(res.body.data.note.isPinned).toBe(false);
      expect(res.body.data.note.isArchived).toBe(false);
      expect(res.body.data.note.isDeleted).toBe(false);
      expect(res.body.data.note.userId).toBe(userA._id.toString());
    });

    it('should reject note creation when title is missing or empty with 400', async () => {
      const res = await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          content: 'No title provided'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject note creation when title exceeds 160 characters with 400', async () => {
      const longTitle = 'a'.repeat(161);
      const res = await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ title: longTitle });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject note creation when tags exceed 10 items with 400', async () => {
      const tags = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'];
      const res = await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ title: 'Tags Test', tags });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject note creation when a tag exceeds 30 characters with 400', async () => {
      const res = await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          title: 'Long Tag Test',
          tags: ['valid-tag', 'a'.repeat(31)]
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject note creation when color is not an allowed enum with 400', async () => {
      const res = await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          title: 'Invalid Color Test',
          color: 'neon-orange'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/notes/:id and PUT /api/notes/:id', () => {
    it('should retrieve a single note for its owner with 200', async () => {
      const note = await Note.create({
        userId: userA._id,
        title: 'Single Note',
        content: 'Content here'
      });

      const res = await request(app)
        .get(`/api/notes/${note._id}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.note.id).toBe(note._id.toString());
      expect(res.body.data.note.title).toBe('Single Note');
    });

    it('should return 404 for non-existent note ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/notes/${nonExistentId}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 for invalid mongo ID format', async () => {
      const res = await request(app)
        .get('/api/notes/invalid-id-format')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should update note fields successfully with 200', async () => {
      const note = await Note.create({
        userId: userA._id,
        title: 'Original Title',
        content: 'Original Content',
        tags: ['old']
      });

      const res = await request(app)
        .put(`/api/notes/${note._id}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          title: 'Updated Title',
          content: 'Updated Content',
          tags: ['new', 'updated'],
          color: 'green'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.note.title).toBe('Updated Title');
      expect(res.body.data.note.content).toBe('Updated Content');
      expect(res.body.data.note.tags).toEqual(['new', 'updated']);
      expect(res.body.data.note.color).toBe('green');
    });

    it('should reject note update if title is set to empty with 400', async () => {
      const note = await Note.create({
        userId: userA._id,
        title: 'Valid Title'
      });

      const res = await request(app)
        .put(`/api/notes/${note._id}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ title: '   ' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Pin, Archive, Soft Delete, Restore, and Permanent Delete', () => {
    it('should toggle pin status and unarchive if pinned', async () => {
      const note = await Note.create({
        userId: userA._id,
        title: 'Pin Test Note',
        isPinned: false,
        isArchived: true
      });

      // Pin the note
      const pinRes = await request(app)
        .patch(`/api/notes/${note._id}/pin`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(pinRes.status).toBe(200);
      expect(pinRes.body.data.note.isPinned).toBe(true);
      expect(pinRes.body.data.note.isArchived).toBe(false);

      // Unpin the note
      const unpinRes = await request(app)
        .patch(`/api/notes/${note._id}/pin`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(unpinRes.status).toBe(200);
      expect(unpinRes.body.data.note.isPinned).toBe(false);
    });

    it('should toggle archive status and unpin if archived', async () => {
      const note = await Note.create({
        userId: userA._id,
        title: 'Archive Test Note',
        isPinned: true,
        isArchived: false
      });

      // Archive the note
      const archiveRes = await request(app)
        .patch(`/api/notes/${note._id}/archive`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(archiveRes.status).toBe(200);
      expect(archiveRes.body.data.note.isArchived).toBe(true);
      expect(archiveRes.body.data.note.isPinned).toBe(false);

      // Unarchive the note
      const unarchiveRes = await request(app)
        .patch(`/api/notes/${note._id}/archive`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(unarchiveRes.status).toBe(200);
      expect(unarchiveRes.body.data.note.isArchived).toBe(false);
    });

    it('should soft delete note and unpin it with 200', async () => {
      const note = await Note.create({
        userId: userA._id,
        title: 'Soft Delete Note',
        isPinned: true,
        isDeleted: false
      });

      const res = await request(app)
        .delete(`/api/notes/${note._id}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.note.isDeleted).toBe(true);
      expect(res.body.data.note.isPinned).toBe(false);

      const inDb = await Note.findById(note._id);
      expect(inDb.isDeleted).toBe(true);
    });

    it('should restore note from trash with 200', async () => {
      const note = await Note.create({
        userId: userA._id,
        title: 'Restore Note',
        isDeleted: true
      });

      const res = await request(app)
        .patch(`/api/notes/${note._id}/restore`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.note.isDeleted).toBe(false);

      const inDb = await Note.findById(note._id);
      expect(inDb.isDeleted).toBe(false);
    });

    it('should permanently delete note ONLY if it is in trash with 204', async () => {
      const trashedNote = await Note.create({
        userId: userA._id,
        title: 'Trashed Note',
        isDeleted: true
      });

      const res = await request(app)
        .delete(`/api/notes/${trashedNote._id}/permanent`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(204);

      const inDb = await Note.findById(trashedNote._id);
      expect(inDb).toBeNull();
    });

    it('should refuse permanent delete if note is NOT in trash with 404', async () => {
      const activeNote = await Note.create({
        userId: userA._id,
        title: 'Active Note Not In Trash',
        isDeleted: false
      });

      const res = await request(app)
        .delete(`/api/notes/${activeNote._id}/permanent`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(404);

      const inDb = await Note.findById(activeNote._id);
      expect(inDb).not.toBeNull();
    });
  });

  describe('Search, Filters, and Pagination', () => {
    beforeEach(async () => {
      // Create test dataset for user A
      await Note.create([
        {
          userId: userA._id,
          title: 'JavaScript Tips',
          content: 'Closures and prototypes in JS',
          tags: ['javascript', 'web'],
          color: 'yellow',
          isPinned: true
        },
        {
          userId: userA._id,
          title: 'Python Essentials',
          content: 'Generators and list comprehensions',
          tags: ['python', 'backend'],
          color: 'blue',
          isPinned: false
        },
        {
          userId: userA._id,
          title: 'Database Design',
          content: 'MongoDB indexing and schema design with JS notes',
          tags: ['database', 'web'],
          color: 'green',
          isPinned: false
        },
        {
          userId: userA._id,
          title: 'Archived Idea',
          content: 'Old thought not in active view',
          tags: ['archived'],
          color: 'purple',
          isArchived: true
        },
        {
          userId: userA._id,
          title: 'Deleted Draft',
          content: 'Trashed draft',
          tags: ['trash'],
          color: 'pink',
          isDeleted: true
        }
      ]);
    });

    it('should list only active notes by default (not archived, not deleted)', async () => {
      const res = await request(app)
        .get('/api/notes')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.notes).toHaveLength(3);
      expect(res.body.data.pagination.total).toBe(3);

      // Verify pinned note comes first
      expect(res.body.data.notes[0].isPinned).toBe(true);
      expect(res.body.data.notes[0].title).toBe('JavaScript Tips');
    });

    it('should filter by archived=true', async () => {
      const res = await request(app)
        .get('/api/notes?archived=true')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.notes).toHaveLength(1);
      expect(res.body.data.notes[0].title).toBe('Archived Idea');
    });

    it('should filter by deleted=true (trash)', async () => {
      const res = await request(app)
        .get('/api/notes?deleted=true')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.notes).toHaveLength(1);
      expect(res.body.data.notes[0].title).toBe('Deleted Draft');
    });

    it('should search case-insensitively across title and content', async () => {
      const res = await request(app)
        .get('/api/notes?search=javascript')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      // Matches 'JavaScript Tips' (title) and 'Database Design' (content has 'JS notes' wait, search=javascript matches title 'JavaScript Tips')
      expect(res.body.data.notes.some((n) => n.title === 'JavaScript Tips')).toBe(true);
    });

    it('should handle search queries with regex special characters safely without error', async () => {
      await Note.create({
        userId: userA._id,
        title: 'Special chars note: [test] (regex)',
        content: 'C++ & RegExp'
      });

      const res = await request(app)
        .get('/api/notes')
        .query({ search: '[test] (regex)' })
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.notes).toHaveLength(1);
      expect(res.body.data.notes[0].title).toBe('Special chars note: [test] (regex)');
    });

    it('should filter by tag', async () => {
      const res = await request(app)
        .get('/api/notes?tag=backend')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.notes).toHaveLength(1);
      expect(res.body.data.notes[0].title).toBe('Python Essentials');
    });

    it('should filter by color', async () => {
      const res = await request(app)
        .get('/api/notes?color=yellow')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.notes).toHaveLength(1);
      expect(res.body.data.notes[0].color).toBe('yellow');
    });

    it('should paginate correctly with limit and page', async () => {
      const res = await request(app)
        .get('/api/notes?limit=2&page=1')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.notes).toHaveLength(2);
      expect(res.body.data.pagination.page).toBe(1);
      expect(res.body.data.pagination.limit).toBe(2);
      expect(res.body.data.pagination.total).toBe(3);
      expect(res.body.data.pagination.pages).toBe(2);
    });
  });

  describe('CRITICAL: Cross-User Isolation Tests', () => {
    let noteA;

    beforeEach(async () => {
      noteA = await Note.create({
        userId: userA._id,
        title: 'Private Note of User A',
        content: 'Top secret knowledge base content',
        tags: ['secret', 'personal'],
        color: 'purple',
        isPinned: true
      });
    });

    it('User B cannot retrieve User A note (GET /api/notes/:id returns 404)', async () => {
      const res = await request(app)
        .get(`/api/notes/${noteA._id}`)
        .set('Authorization', `Bearer ${tokenB}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('User B cannot update User A note (PUT /api/notes/:id returns 404)', async () => {
      const res = await request(app)
        .put(`/api/notes/${noteA._id}`)
        .set('Authorization', `Bearer ${tokenB}`)
        .send({
          title: 'Hacked Title',
          content: 'Compromised content'
        });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);

      // Verify User A note remained unchanged
      const unchanged = await Note.findById(noteA._id);
      expect(unchanged.title).toBe('Private Note of User A');
      expect(unchanged.content).toBe('Top secret knowledge base content');
    });

    it('User B cannot soft delete User A note (DELETE /api/notes/:id returns 404)', async () => {
      const res = await request(app)
        .delete(`/api/notes/${noteA._id}`)
        .set('Authorization', `Bearer ${tokenB}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);

      const unchanged = await Note.findById(noteA._id);
      expect(unchanged.isDeleted).toBe(false);
    });

    it('User B cannot toggle pin on User A note (PATCH /api/notes/:id/pin returns 404)', async () => {
      const res = await request(app)
        .patch(`/api/notes/${noteA._id}/pin`)
        .set('Authorization', `Bearer ${tokenB}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);

      const unchanged = await Note.findById(noteA._id);
      expect(unchanged.isPinned).toBe(true);
    });

    it('User B cannot toggle archive on User A note (PATCH /api/notes/:id/archive returns 404)', async () => {
      const res = await request(app)
        .patch(`/api/notes/${noteA._id}/archive`)
        .set('Authorization', `Bearer ${tokenB}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);

      const unchanged = await Note.findById(noteA._id);
      expect(unchanged.isArchived).toBe(false);
    });

    it('User B cannot restore User A note (PATCH /api/notes/:id/restore returns 404)', async () => {
      // Set noteA to deleted
      noteA.isDeleted = true;
      await noteA.save();

      const res = await request(app)
        .patch(`/api/notes/${noteA._id}/restore`)
        .set('Authorization', `Bearer ${tokenB}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);

      const unchanged = await Note.findById(noteA._id);
      expect(unchanged.isDeleted).toBe(true);
    });

    it('User B cannot permanently delete User A note (DELETE /api/notes/:id/permanent returns 404)', async () => {
      noteA.isDeleted = true;
      await noteA.save();

      const res = await request(app)
        .delete(`/api/notes/${noteA._id}/permanent`)
        .set('Authorization', `Bearer ${tokenB}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);

      const inDb = await Note.findById(noteA._id);
      expect(inDb).not.toBeNull();
    });

    it('User B listing notes does NOT include User A notes', async () => {
      const res = await request(app)
        .get('/api/notes')
        .set('Authorization', `Bearer ${tokenB}`);

      expect(res.status).toBe(200);
      expect(res.body.data.notes).toHaveLength(0);
      expect(res.body.data.pagination.total).toBe(0);
    });

    it('User B searching notes does NOT match User A notes', async () => {
      const res = await request(app)
        .get('/api/notes?search=secret')
        .set('Authorization', `Bearer ${tokenB}`);

      expect(res.status).toBe(200);
      expect(res.body.data.notes).toHaveLength(0);
      expect(res.body.data.pagination.total).toBe(0);
    });

    it('User B trash does NOT include User A trashed notes', async () => {
      noteA.isDeleted = true;
      await noteA.save();

      const res = await request(app)
        .get('/api/notes?deleted=true')
        .set('Authorization', `Bearer ${tokenB}`);

      expect(res.status).toBe(200);
      expect(res.body.data.notes).toHaveLength(0);
      expect(res.body.data.pagination.total).toBe(0);
    });

    it('User B archive does NOT include User A archived notes', async () => {
      noteA.isArchived = true;
      await noteA.save();

      const res = await request(app)
        .get('/api/notes?archived=true')
        .set('Authorization', `Bearer ${tokenB}`);

      expect(res.status).toBe(200);
      expect(res.body.data.notes).toHaveLength(0);
      expect(res.body.data.pagination.total).toBe(0);
    });
  });
});
