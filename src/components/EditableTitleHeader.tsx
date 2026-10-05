import React from 'react';
import { Pencil, Copy, Check } from 'lucide-react';

interface EditableTitleHeaderProps {
  isEditing: boolean;
  value: string;
  onChange: (value: string) => void;
  onCancel: () => void;
  title: string;
  onStartEdit: () => void;
  onDuplicate?: () => void;
  isActive?: boolean;
  activeBadgeText?: string;
  placeholder?: string;
  cancelLabel: string;
  editTooltip?: string;
  duplicateTooltip?: string;
  isMonospace?: boolean;
  disabled?: boolean;
  canEdit?: boolean;
  tag?: 'h2' | 'h3';
}

export const EditableTitleHeader: React.FC<EditableTitleHeaderProps> = ({
  isEditing,
  value,
  onChange,
  onCancel,
  title,
  onStartEdit,
  onDuplicate,
  isActive,
  activeBadgeText,
  placeholder,
  cancelLabel,
  editTooltip,
  duplicateTooltip,
  isMonospace = false,
  disabled = false,
  canEdit = true,
  tag = 'h2',
}) => {
  if (isEditing) {
    return (
      <div className="relative flex-1 min-w-[200px] flex items-center gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoFocus
          className={`form-input text-base font-semibold py-1 pr-14 ${isMonospace ? 'font-mono' : ''}`}
        />
        <button
          type="button"
          onClick={onCancel}
          className="absolute right-2.5 text-xs text-neutral-400 hover:text-neutral-700 font-medium cursor-pointer"
        >
          {cancelLabel}
        </button>
      </div>
    );
  }

  const HeadingTag = tag;

  return (
    <div className="flex items-center gap-2 flex-wrap min-w-0">
      <HeadingTag
        className={`font-semibold text-neutral-900 truncate ${
          isMonospace ? 'text-sm font-mono' : 'text-base'
        }`}
      >
        {title || placeholder}
      </HeadingTag>

      {canEdit && (
        <button
          type="button"
          onClick={onStartEdit}
          disabled={disabled}
          title={editTooltip}
          className="p-1 rounded hover:bg-neutral-200 transition cursor-pointer"
        >
          <Pencil className="w-4 h-4" />
        </button>
      )}

      {onDuplicate && (
        <button
          type="button"
          onClick={onDuplicate}
          disabled={disabled}
          title={duplicateTooltip}
          className="p-1 rounded hover:bg-neutral-200 transition cursor-pointer text-neutral-600 hover:text-neutral-900"
        >
          <Copy className="w-4 h-4" />
        </button>
      )}

      {isActive && activeBadgeText && (
        <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded-full shrink-0">
          <Check className="w-3 h-3" />
          {activeBadgeText}
        </span>
      )}
    </div>
  );
};
