const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const {
  connectTestDB,
  closeTestDB,
  clearTestDB,
  createTestUser,
  getAuthToken
} = require('./setup');

describe('User Endpoints', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  afterEach(async () => {
    await clearTestDB();
  });

  describe('PUT /api/users/me (Update Profile)', () => {
    it('should update name and avatarUrl successfully', async () => {
      const { user } = await createTestUser({ name: 'Initial Name' });
      const token = getAuthToken(user);

      const res = await request(app)
        .put('/api/users/me')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Updated Name',
          avatarUrl: 'https://example.com/avatar.jpg'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.name).toBe('Updated Name');
      expect(res.body.data.user.avatarUrl).toBe('https://example.com/avatar.jpg');

      const inDb = await User.findById(user._id);
      expect(inDb.name).toBe('Updated Name');
      expect(inDb.avatarUrl).toBe('https://example.com/avatar.jpg');
    });

    it('should reject invalid avatarUrl with 400', async () => {
      const { user } = await createTestUser();
      const token = getAuthToken(user);

      const res = await request(app)
        .put('/api/users/me')
        .set('Authorization', `Bearer ${token}`)
        .send({
          avatarUrl: 'not-a-valid-url'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject name shorter than 2 characters with 400', async () => {
      const { user } = await createTestUser();
      const token = getAuthToken(user);

      const res = await request(app)
        .put('/api/users/me')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'X' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject unauthenticated request with 401', async () => {
      const res = await request(app)
        .put('/api/users/me')
        .send({ name: 'Hacker' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/users/me/password (Change Password)', () => {
    it('should successfully change password, increment tokenVersion, invalidate old token, and return new token', async () => {
      const { user } = await createTestUser({ password: 'OldPassword123' });
      const oldToken = getAuthToken(user);

      const res = await request(app)
        .put('/api/users/me/password')
        .set('Authorization', `Bearer ${oldToken}`)
        .send({
          currentPassword: 'OldPassword123',
          newPassword: 'BrandNewPassword456',
          confirmPassword: 'BrandNewPassword456'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();

      const newToken = res.body.data.token;

      // Verify tokenVersion incremented in DB
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.tokenVersion).toBe(1);

      // Verify old token is rejected due to tokenVersion mismatch
      const oldTokenRes = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${oldToken}`);
      expect(oldTokenRes.status).toBe(401);
      expect(oldTokenRes.body.error.code).toBe('TOKEN_INVALIDATED');

      // Verify new token works
      const newTokenRes = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${newToken}`);
      expect(newTokenRes.status).toBe(200);
      expect(newTokenRes.body.data.user.email).toBe(user.email);
    });

    it('should reject change password if current password is wrong', async () => {
      const { user } = await createTestUser({ password: 'RealPassword123' });
      const token = getAuthToken(user);

      const res = await request(app)
        .put('/api/users/me/password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'WrongPassword999',
          newPassword: 'NewPassword123',
          confirmPassword: 'NewPassword123'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_CURRENT_PASSWORD');
    });

    it('should reject weak new password with 400', async () => {
      const { user } = await createTestUser({ password: 'CurrentPass123' });
      const token = getAuthToken(user);

      const res = await request(app)
        .put('/api/users/me/password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'CurrentPass123',
          newPassword: 'short',
          confirmPassword: 'short'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject mismatched confirmPassword with 400', async () => {
      const { user } = await createTestUser({ password: 'CurrentPass123' });
      const token = getAuthToken(user);

      const res = await request(app)
        .put('/api/users/me/password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'CurrentPass123',
          newPassword: 'ValidNewPassword123',
          confirmPassword: 'DifferentPassword123'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
