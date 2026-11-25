import React, { useState, useEffect } from 'react';
import { FiUser, FiMail, FiImage, FiLock, FiCheck, FiMoon, FiSun } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import * as usersApi from '../api/users';
import Avatar from '../components/Avatar';
import FormInput from '../components/FormInput';
import Button from '../components/Button';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();

  // Profile info state
  const [name, setName] = useState(user?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordErrors, setPasswordErrors] = useState({});
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setAvatarUrl(user.avatarUrl || '');
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    setIsUpdatingProfile(true);
    try {
      const response = await usersApi.updateProfile({
        name: name.trim(),
        avatarUrl: avatarUrl.trim() || undefined,
      });

      if (response && response.success) {
        const updatedUser = response.data?.user || response.data;
        updateUser(updatedUser);
        toast.success('Profile updated successfully');
      }
    } catch (err) {
      console.error('Update profile error:', err);
      const msg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        'Failed to update profile';
      toast.error(msg);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const errors = {};

    if (!currentPassword) {
      errors.currentPassword = 'Enter current password';
    }
    if (!newPassword) {
      errors.newPassword = 'Enter new password';
    } else if (newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters';
    }
    if (!confirmPassword) {
      errors.confirmPassword = 'Confirm your new password';
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    setPasswordErrors({});
    setIsChangingPassword(true);

    try {
      await usersApi.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('Change password error:', err);
      const msg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        'Failed to change password. Please verify your current password.';
      toast.error(msg);
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Account Settings
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Manage your personal profile, security credentials, and app preferences
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Avatar Preview & Quick Info */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col items-center text-center">
            <Avatar src={avatarUrl} name={name || user?.email} size="xl" className="mb-4" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {name || 'User'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 break-all">
              {user?.email}
            </p>

            <div className="w-full mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Theme</span>
              <button
                type="button"
                onClick={toggleTheme}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              >
                {isDark ? <FiSun className="w-3.5 h-3.5 text-amber-400" /> : <FiMoon className="w-3.5 h-3.5 text-indigo-600" />}
                <span>{isDark ? 'Dark' : 'Light'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Profile & Password Forms */}
        <div className="md:col-span-2 space-y-6">
          {/* Profile Form */}
          <section className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
              Personal Information
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Update your display name and public avatar image URL
            </p>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <FormInput
                label="Email Address"
                id="profile-email"
                type="email"
                value={user?.email || ''}
                disabled
                helperText="Email cannot be changed directly."
                leftIcon={<FiMail className="w-4 h-4" />}
              />

              <FormInput
                label="Full Name"
                id="profile-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                leftIcon={<FiUser className="w-4 h-4" />}
              />

              <FormInput
                label="Avatar URL (Optional)"
                id="profile-avatar"
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                helperText="Link to an image file (PNG, JPG, SVG)."
                leftIcon={<FiImage className="w-4 h-4" />}
              />

              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  isLoading={isUpdatingProfile}
                  leftIcon={<FiCheck className="w-4 h-4" />}
                >
                  Save Profile
                </Button>
              </div>
            </form>
          </section>

          {/* Password Change Form */}
          <section className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
              Change Password
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Ensure your account is using a long, random password to stay secure
            </p>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <FormInput
                label="Current Password"
                id="current-password"
                type="password"
                required
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  if (passwordErrors.currentPassword) {
                    setPasswordErrors((prev) => ({ ...prev, currentPassword: '' }));
                  }
                }}
                error={passwordErrors.currentPassword}
                placeholder="••••••••"
                leftIcon={<FiLock className="w-4 h-4" />}
              />

              <FormInput
                label="New Password"
                id="new-password"
                type="password"
                required
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (passwordErrors.newPassword) {
                    setPasswordErrors((prev) => ({ ...prev, newPassword: '' }));
                  }
                }}
                error={passwordErrors.newPassword}
                placeholder="At least 6 characters"
                leftIcon={<FiLock className="w-4 h-4" />}
              />

              <FormInput
                label="Confirm New Password"
                id="confirm-new-password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (passwordErrors.confirmPassword) {
                    setPasswordErrors((prev) => ({ ...prev, confirmPassword: '' }));
                  }
                }}
                error={passwordErrors.confirmPassword}
                placeholder="Re-enter new password"
                leftIcon={<FiLock className="w-4 h-4" />}
              />

              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isChangingPassword}
                  leftIcon={<FiLock className="w-4 h-4" />}
                >
                  Update Password
                </Button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
