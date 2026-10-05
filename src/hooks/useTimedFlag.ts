import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Hook to manage a boolean flag that automatically reverts to false after a duration.
 */
export function useTimedFlag(duration = 2000) {
  const [flag, setFlag] = useState<boolean>(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const trigger = useCallback(() => {
    setFlag(true);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      setFlag(false);
      timerRef.current = null;
    }, duration);
  }, [duration]);

  const reset = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setFlag(false);
  }, []);

  return [flag, trigger, reset] as const;
}

/**
 * Hook to manage a temporary state value that reverts to defaultValue after a duration.
 */
export function useTimedValue<T>(defaultValue: T, duration = 3000) {
  const [value, setValue] = useState<T>(defaultValue);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const setTimedValue = useCallback(
    (newValue: T) => {
      setValue(newValue);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        setValue(defaultValue);
        timerRef.current = null;
      }, duration);
    },
    [defaultValue, duration]
  );

  const reset = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setValue(defaultValue);
  }, [defaultValue]);

  return [value, setTimedValue, reset] as const;
}
