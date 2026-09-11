import { Dispatch, SetStateAction } from 'react';

type LocalStorageApi<T> = [
  T,
  Dispatch<SetStateAction<T | undefined>>,
  () => void
];

export default LocalStorageApi;
