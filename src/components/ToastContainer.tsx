import React, { useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X, RefreshCw } from 'lucide-react';
import { SupportedLanguage, TRANSLATIONS } from '../i18n/translations';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface NotificationState {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
}

export interface ToastContainerProps {
  notification: NotificationState | null;
  onDismiss: () => void;
  language?: SupportedLanguage;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  notification,
  onDismiss,
  language = 'en',
}) => {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, notification.duration || 5000);

    return () => clearTimeout(timer);
  }, [notification, onDismiss]);

  if (!notification && !needRefresh) return null;

  const t = TRANSLATIONS[language];

  const typeConfig = {
    info: {
      border: 'border-neutral-200',
      icon: <Info className="w-4 h-4 text-neutral-100 shrink-0" />,
    },
    success: {
      border: 'border-emerald-200',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />,
    },
    warning: {
      border: 'border-amber-200',
      icon: <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />,
    },
    error: {
      border: 'border-rose-200',
      icon: <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />,
    },
  };

  return (
    <div
      aria-live="polite"
      className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 max-w-sm w-[calc(100%-2.5rem)] pointer-events-none max-sm:bottom-4 max-sm:left-4 max-sm:right-4 max-sm:w-auto"
    >
      {/* PWA System Update Toast */}
      {needRefresh && (
        <div
          role="alert"
          className="pointer-events-auto flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-sm border border-neutral-800 bg-neutral-900 text-white shadow-lg text-sm transition-all"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <RefreshCw className="w-4 h-4 text-neutral-300 shrink-0" />
            <p className="text-xs font-medium text-neutral-100 leading-snug">
              A new version is available.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => updateServiceWorker(true)}
              className="bg-white hover:bg-neutral-100 text-neutral-950 font-semibold px-2.5 py-1 rounded text-xs transition-colors cursor-pointer"
            >
              Update
            </button>
            <button
              type="button"
              onClick={() => setNeedRefresh(false)}
              className="text-neutral-400 hover:text-white p-1 rounded transition-colors cursor-pointer"
              aria-label={t.common.dismiss}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Action / Event Notification Toast */}
      {notification && (
        <div
          role="alert"
          className={`pointer-events-auto flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-sm border border-neutral-800 bg-neutral-900 text-white shadow-lg text-sm transition-all ${
            typeConfig[notification.type].border
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {typeConfig[notification.type].icon}
            <p className="text-xs font-medium text-neutral-100 leading-snug break-words">
              {notification.message}
            </p>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            className="p-1 rounded hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer shrink-0"
            aria-label="Close notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
