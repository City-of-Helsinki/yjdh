import { UseFormRegister } from 'react-hook-form';

type Id<T> = NonNullable<Parameters<UseFormRegister<T>>[0]>;

export default Id;
