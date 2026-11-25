import React, { useMemo } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

// Configure marked defaults
marked.setOptions({
  gfm: true,
  breaks: true,
});

export default function MarkdownPreview({ content = '', className = '' }) {
  const sanitizedHtml = useMemo(() => {
    if (!content || !content.trim()) {
      return '';
    }
    try {
      const rawHtml = marked.parse(content);
      return DOMPurify.sanitize(rawHtml);
    } catch (err) {
      console.error('Error rendering markdown:', err);
      return '<p class="text-red-500">Error rendering markdown</p>';
    }
  }, [content]);

  if (!sanitizedHtml) {
    return (
      <div className={`text-slate-400 dark:text-slate-500 italic py-4 ${className}`}>
        No content to preview...
      </div>
    );
  }

  return (
    <div
      className={`prose prose-slate dark:prose-invert max-w-none prose-sm sm:prose-base prose-headings:font-semibold prose-a:text-indigo-600 dark:prose-a:text-indigo-400 prose-code:text-indigo-600 dark:prose-code:text-indigo-300 prose-code:bg-slate-100 dark:prose-code:bg-slate-800/80 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-800 ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
}
