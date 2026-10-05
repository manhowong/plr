import React, { useMemo } from 'react';
import { renderMarkdown } from '../utils/markdown';

interface MarkdownPreviewProps {
  content: string;
  placeholder?: string;
  className?: string;
}

export const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ content, placeholder, className = '' }) => {
  const html = useMemo(() => renderMarkdown(content), [content]);
  if (!content.trim()) {
    return (
      <div className={`flex flex-col items-center justify-center p-4 text-center min-h-[288px] ${className}`}>
        <p className="text-sm font-medium text-neutral-400">{placeholder}</p>
      </div>
    );
  }
  return <div className={`md-preview ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
};
