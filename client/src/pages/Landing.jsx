import React from 'react';
import { Link } from 'react-router-dom';
import {
  FiEdit3,
  FiSearch,
  FiTag,
  FiShield,
  FiFolder,
  FiArrowRight,
  FiCheckCircle,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';

export default function Landing() {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: <FiEdit3 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />,
      title: 'Full Markdown Support',
      description:
        'Write in clean, GitHub-flavored markdown with real-time sanitized preview, code blocks, lists, and formatting.',
    },
    {
      icon: <FiSearch className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />,
      title: 'Instant Debounced Search',
      description:
        'Find any note instantly across titles, markdown content, and tags with fast, non-blocking search.',
    },
    {
      icon: <FiTag className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />,
      title: 'Tags & Color Coding',
      description:
        'Tag your notes for quick categorical filtering and apply calm pastel colors to visually separate topics.',
    },
    {
      icon: <FiFolder className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />,
      title: 'Pin, Archive & Trash',
      description:
        'Keep essential ideas pinned at the top, archive completed notes, and safely restore soft-deleted items.',
    },
    {
      icon: <FiShield className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />,
      title: 'Private & Secure JWT Auth',
      description:
        'Your knowledge base is private to you with secure bcrypt hashing and JSON Web Token session management.',
    },
    {
      icon: <FiCheckCircle className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />,
      title: 'Dark Mode & Responsive',
      description:
        'Seamlessly switch between calm light and dark themes with full optimization across mobile, tablet, and desktop.',
    },
  ];

  return (
    <div className="flex-1 flex flex-col justify-center">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-24 px-4 sm:px-6 lg:px-8 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 mb-6">
          <span>✨ Modern MERN Knowledge Base</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
          Think clearly. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">
            Organize knowledge effortlessly.
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          A minimalist, lightning-fast workspace for your notes, thoughts, and documentation. Powered by Markdown, smart tags, and rich color organization.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          {isAuthenticated ? (
            <Link to="/notes">
              <Button size="lg" rightIcon={<FiArrowRight />}>
                Go to Workspace
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/register">
                <Button size="lg" rightIcon={<FiArrowRight />}>
                  Start Taking Notes — Free
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="secondary" size="lg">
                  Sign In to Your Base
                </Button>
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Interactive Mockup Preview Card */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 mb-20 w-full">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden p-6 sm:p-8">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
            </div>
            <span className="text-xs font-mono text-slate-400">notes-workspace.preview</span>
            <div className="w-12" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            <div className="p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/40">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                Pinned • Project Architecture
              </span>
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 mt-1 mb-2">
                Distributed Cache Strategy
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                Using Redis cluster for read-heavy query invalidation. In-memory fallback layer ensures 99.99% availability.
              </p>
              <div className="flex gap-1.5">
                <span className="text-[10px] px-2 py-0.5 rounded bg-black/5 dark:bg-white/10 font-medium">#backend</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-black/5 dark:bg-white/10 font-medium">#caching</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40">
              <span className="text-xs font-semibold uppercase tracking-wider text-sky-700 dark:text-sky-400">
                Markdown Ready
              </span>
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 mt-1 mb-2">
                Weekly Sprint Objectives
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                - [x] Finalize database schema migration<br />
                - [x] Integrate JWT refresh handling<br />
                - [ ] Deploy client build to production
              </p>
              <div className="flex gap-1.5">
                <span className="text-[10px] px-2 py-0.5 rounded bg-black/5 dark:bg-white/10 font-medium">#roadmap</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-black/5 dark:bg-white/10 font-medium">#sprint</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
            Designed for focused minds
          </h2>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Everything you need for clean thoughts, without overwhelming complexity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feat, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition"
            >
              <div className="p-3 w-fit rounded-xl bg-slate-100 dark:bg-slate-800 mb-4">
                {feat.icon}
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2">
                {feat.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {feat.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
