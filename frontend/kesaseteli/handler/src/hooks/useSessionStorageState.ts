import { Dispatch, SetStateAction,useEffect, useState } from 'react';
import {
  getSessionStorageItem,
  setSessionStorageItem,
} from 'shared/utils/localstorage.utils';

export default function useSessionStorageState<T>(
  key: string,
  initialValue: T
): [T, Dispatch<SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    const saved = getSessionStorageItem(key);
    if (saved !== '') {
      try {
        return JSON.parse(saved) as T;
      } catch {
        return saved as unknown as T;
      }
    }
    return initialValue;
  });

  useEffect(() => {
    const stringValue =
      typeof state === 'string' ? state : JSON.stringify(state);
    setSessionStorageItem(key, stringValue);
  }, [key, state]);

  return [state, setState];
}
