import apiClient from './axios';

/**
 * Update user profile (name, avatarUrl).
 * @param {Object} data { name, avatarUrl }
 */
export async function updateProfile(data) {
  const response = await apiClient.put('/users/me', data);
  return response.data;
}

/**
 * Change current user password.
 * @param {Object} data { currentPassword, newPassword, confirmPassword }
 */
export async function changePassword(data) {
  const response = await apiClient.put('/users/me/password', data);
  return response.data;
}
