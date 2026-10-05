import { useEffect, useRef } from 'react';

/**
 * Hook to register dirty checking for forms with automated unmount cleanup.
 */
export function useFormDirtyGuard<P extends string>(
  page: P,
  isDirty: () => boolean,
  onRegisterDirtyCheck: (page: P, checker: (() => boolean) | null) => void,
  deps: React.DependencyList
) {
  const isDirtyRef = useRef(isDirty);
  isDirtyRef.current = isDirty;

  useEffect(() => {
    const checker = () => isDirtyRef.current();
    onRegisterDirtyCheck(page, checker);
    return () => {
      onRegisterDirtyCheck(page, null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, onRegisterDirtyCheck, ...deps]);
}

