import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Hook to handle copying text to clipboard with temporary feedback states and automatic cleanup.
 */
export function useClipboard(duration = 2000) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const copy = useCallback(
    async (text: string, id = 'default'): Promise<boolean> => {
      try {
        await navigator.clipboard.writeText(text);
        setCopiedId(id);
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
        timerRef.current = setTimeout(() => {
          setCopiedId(null);
          timerRef.current = null;
        }, duration);
        return true;
      } catch (err) {
        console.error('Failed to copy to clipboard', err);
        return false;
      }
    },
    [duration]
  );

  const isCopied = useCallback(
    (id = 'default') => copiedId === id,
    [copiedId]
  );

  return { copiedId, isCopied, copy };
}
