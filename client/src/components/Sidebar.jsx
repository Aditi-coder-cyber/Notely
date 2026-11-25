import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  FiBookOpen,
  FiArchive,
  FiTrash2,
  FiUser,
  FiLogOut,
  FiPlus,
  FiX,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';
import ThemeToggle from './ThemeToggle';
import toast from 'react-hot-toast';

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const navLinks = [
    { to: '/notes', label: 'All Notes', icon: FiBookOpen },
    { to: '/archive', label: 'Archive', icon: FiArchive },
    { to: '/trash', label: 'Trash', icon: FiTrash2 },
    { to: '/profile', label: 'Profile', icon: FiUser },
  ];

  const handleNavClick = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Top Header & Brand */}
        <div className="flex flex-col">
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200/80 dark:border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
                N
              </div>
              <span className="font-semibold text-slate-900 dark:text-slate-100 text-base tracking-tight">
                Notes & Base
              </span>
            </div>

            {/* Mobile close button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close menu"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 lg:hidden focus:outline-none"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Create Note Button */}
          <div className="p-4">
            <button
              type="button"
              onClick={() => {
                handleNavClick();
                navigate('/notes/new');
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-medium text-sm shadow-xs transition duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <FiPlus className="w-4 h-4" />
              <span>New Note</span>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1 mt-1" aria-label="Main Navigation">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={handleNavClick}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Profile & Preferences */}
        <div className="p-4 border-t border-slate-200/80 dark:border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <div
              onClick={() => {
                handleNavClick();
                navigate('/profile');
              }}
              className="flex items-center gap-3 cursor-pointer group flex-1 min-w-0 mr-2"
              title="View profile"
            >
              <Avatar
                src={user?.avatarUrl}
                name={user?.name || user?.email || 'User'}
                size="sm"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                  {user?.email}
                </p>
              </div>
            </div>

            <ThemeToggle />
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 dark:text-slate-400 dark:hover:text-red-400 dark:hover:bg-red-950/30 transition duration-150 focus:outline-none"
          >
            <FiLogOut className="w-4 h-4 shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
