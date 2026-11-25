import React from 'react';
import { Link } from 'react-router-dom';
import { FiHome, FiCompass } from 'react-icons/fi';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';

export default function NotFound() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-6 shadow-sm">
        <FiCompass className="w-8 h-8" />
      </div>

      <span className="text-sm font-semibold tracking-wider text-indigo-600 dark:text-indigo-400 uppercase">
        404 Error
      </span>
      <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
        Page Not Found
      </h1>
      <p className="mt-3 text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>

      <div className="mt-8">
        <Link to={isAuthenticated ? '/notes' : '/'}>
          <Button leftIcon={<FiHome className="w-4 h-4" />}>
            {isAuthenticated ? 'Back to Notes' : 'Return to Home'}
          </Button>
        </Link>
      </div>
    </div>
  );
}
