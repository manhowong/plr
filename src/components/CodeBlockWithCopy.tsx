import React from 'react';

interface CodeBlockWithCopyProps {
  code: string;
  isCopied: boolean;
  onCopy: () => void;
  copyLabel: string;
  copiedLabel: string;
}

export const CodeBlockWithCopy: React.FC<CodeBlockWithCopyProps> = ({
  code,
  isCopied,
  onCopy,
  copyLabel,
  copiedLabel,
}) => {
  return (
    <div className="relative bg-neutral-50 border border-neutral-200 text-neutral-800 p-4 rounded-md font-mono text-xs leading-relaxed overflow-x-auto">
      <button
        type="button"
        onClick={onCopy}
        className="absolute top-2.5 right-2.5 text-xs text-neutral-600 hover:text-neutral-950 bg-white px-2.5 py-1 rounded border border-neutral-200 shadow-2xs cursor-pointer transition-colors"
      >
        {isCopied ? copiedLabel : copyLabel}
      </button>
      <pre>{code}</pre>
    </div>
  );
};
