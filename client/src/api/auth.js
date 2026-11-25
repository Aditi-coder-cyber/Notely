import apiClient from './axios';

/**
 * Register a new user account.
 * @param {Object} data { name, email, password, confirmPassword }
 */
export async function register(data) {
  const response = await apiClient.post('/auth/register', data);
  return response.data;
}

/**
 * Log in an existing user.
 * @param {Object} credentials { email, password }
 */
export async function login(credentials) {
  const response = await apiClient.post('/auth/login', credentials);
  return response.data;
}

/**
 * Get current authenticated user profile.
 */
export async function getMe() {
  const response = await apiClient.get('/auth/me');
  return response.data;
}
