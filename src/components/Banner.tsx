import React from 'react';
import { Info, AlertCircle, CheckCircle2, X } from 'lucide-react';

export type BannerVariant = 'warning' | 'info' | 'error' | 'success';

export interface BannerProps {
  variant?: BannerVariant;
  icon?: React.ReactNode;
  children: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  onDismiss?: () => void;
  className?: string;
}

export const Banner: React.FC<BannerProps> = ({
  variant = 'warning',
  icon,
  children,
  action,
  onDismiss,
  className = '',
}) => {
  const variantStyles = {
    warning: {
      container: 'bg-amber-50/90 border-amber-200 text-amber-900',
      icon: <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />,
      action: 'text-amber-900 hover:text-amber-950 underline font-semibold',
      dismiss: 'text-amber-600 hover:text-amber-900',
    },
    info: {
      container: 'bg-neutral-50 border-neutral-200 text-neutral-800',
      icon: <Info className="w-4 h-4 text-neutral-600 shrink-0" />,
      action: 'text-neutral-900 hover:text-black underline font-semibold',
      dismiss: 'text-neutral-400 hover:text-neutral-700',
    },
    error: {
      container: 'bg-rose-50/90 border-rose-200 text-rose-900',
      icon: <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />,
      action: 'text-rose-900 hover:text-rose-950 underline font-semibold',
      dismiss: 'text-rose-600 hover:text-rose-900',
    },
    success: {
      container: 'bg-emerald-50/90 border-emerald-200 text-emerald-900',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />,
      action: 'text-emerald-900 hover:text-emerald-950 underline font-semibold',
      dismiss: 'text-emerald-600 hover:text-emerald-900',
    },
  };

  const current = variantStyles[variant];

  return (
    <div
      role="region"
      className={`flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-md border text-sm leading-relaxed ${current.container} ${className}`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        {icon !== undefined ? icon : current.icon}
        <div className="text-xs sm:text-sm font-medium leading-snug">{children}</div>
      </div>

      <div className="flex items-center gap-3 shrink-0 ml-auto">
        {action && (
          <button
            type="button"
            onClick={action.onClick}
            className={`text-xs sm:text-sm cursor-pointer transition-colors ${current.action}`}
          >
            {action.label}
          </button>
        )}
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className={`p-1 rounded cursor-pointer transition-colors ${current.dismiss}`}
            aria-label="Dismiss banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
