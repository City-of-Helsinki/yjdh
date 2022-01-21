import { UseFormRegister } from 'react-hook-form';

type Id<T> = Parameters<UseFormRegister<T>>[0];

export default Id;
