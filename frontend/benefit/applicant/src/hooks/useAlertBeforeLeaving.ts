import { useCallback, useEffect } from 'react';

export const useAlertBeforeLeaving = (isFormDirty: boolean): void => {
  const alert = useCallback((e: BeforeUnloadEvent) => {
    e?.preventDefault();
    e.returnValue = '';
  }, []);

  useEffect(() => {
    if (isFormDirty) window.addEventListener('beforeunload', alert);

    return () => {
      window.removeEventListener('beforeunload', alert);
    };
  }, [alert, isFormDirty]);
};
