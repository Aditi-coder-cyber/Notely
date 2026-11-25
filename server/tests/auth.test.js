const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../server');
const config = require('../config');
const {
  connectTestDB,
  closeTestDB,
  clearTestDB,
  createTestUser,
  getAuthToken
} = require('./setup');

describe('Auth Endpoints', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  afterEach(async () => {
    await clearTestDB();
  });

  describe('GET /api/health', () => {
    it('should return 200 and healthy status', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('ok');
    });
  });

  describe('POST /api/auth/register', () => {
    const validUser = {
      name: 'Aditi Aggarwal',
      email: 'aditi@example.com',
      password: 'SecurePassword123',
      confirmPassword: 'SecurePassword123'
    };

    it('should register a new user successfully with 201', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(validUser);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.user.email).toBe('aditi@example.com');
      expect(res.body.data.user.name).toBe('Aditi Aggarwal');
      expect(res.body.data.user.passwordHash).toBeUndefined();
      expect(res.body.data.token).toBeDefined();

      // Verify token payload
      const decoded = jwt.verify(res.body.data.token, config.jwtSecret);
      expect(decoded.sub).toBe(res.body.data.user.id);
    });

    it('should reject registration if email is already registered with 409', async () => {
      await createTestUser({ email: 'aditi@example.com' });

      const res = await request(app)
        .post('/api/auth/register')
        .send(validUser);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('CONFLICT');
    });

    it('should reject registration with invalid email format with 400', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...validUser, email: 'not-an-email' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject registration with weak password (missing digit) with 400', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          ...validUser,
          password: 'PasswordNoDigit',
          confirmPassword: 'PasswordNoDigit'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject registration with short password (< 8 chars) with 400', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          ...validUser,
          password: 'Pass1',
          confirmPassword: 'Pass1'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject registration if confirmPassword does not match with 400', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          ...validUser,
          confirmPassword: 'DifferentPassword123'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject registration if name is shorter than 2 chars with 400', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          ...validUser,
          name: 'A'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login an existing user successfully with 200', async () => {
      const { user, password } = await createTestUser({
        email: 'login@example.com',
        password: 'Password123'
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.id).toBe(user._id.toString());
      expect(res.body.data.user.passwordHash).toBeUndefined();
      expect(res.body.data.token).toBeDefined();
    });

    it('should reject login with wrong password with 401', async () => {
      await createTestUser({
        email: 'wrongpass@example.com',
        password: 'Password123'
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'wrongpass@example.com',
          password: 'IncorrectPassword456'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('should reject login for non-existent email with 401', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nobody@example.com',
          password: 'Password123'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('should reject login with missing fields with 400', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'notanemail' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user profile when authenticated', async () => {
      const { user } = await createTestUser({ name: 'Current User' });
      const token = getAuthToken(user);

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.name).toBe('Current User');
      expect(res.body.data.user.email).toBe(user.email);
      expect(res.body.data.user.passwordHash).toBeUndefined();
    });

    it('should reject access without token with 401', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should reject access with invalid/malformed token with 401', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid.token.payload');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_TOKEN');
    });

    it('should reject access with expired token with 401', async () => {
      const { user } = await createTestUser();
      const expiredToken = jwt.sign(
        { sub: user._id.toString(), tokenVersion: user.tokenVersion },
        config.jwtSecret,
        { expiresIn: '-1s' }
      );

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('TOKEN_EXPIRED');
    });

    it('should reject access when tokenVersion has been invalidated with 401', async () => {
      const { user } = await createTestUser({ tokenVersion: 0 });
      const oldToken = getAuthToken(user);

      // Invalidate user's token version
      user.tokenVersion = 1;
      await user.save();

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${oldToken}`);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('TOKEN_INVALIDATED');
    });
  });
});
