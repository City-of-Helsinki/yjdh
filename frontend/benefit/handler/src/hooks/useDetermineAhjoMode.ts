import { getLocalStorageItem } from 'shared/utils/localstorage.utils';

export const useDetermineAhjoMode = (): boolean =>
  !!getLocalStorageItem('newAhjoMode');
