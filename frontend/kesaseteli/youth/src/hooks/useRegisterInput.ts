import { useTranslation } from 'next-i18next';
import {
  FieldError,
  get,
  RegisterOptions,
  useFormContext,
} from 'react-hook-form';
import Id from 'shared/types/id';

type InputProps<T> = {
  id: Id<T>;
  errorText?: string;
  label: string;
  registerOptions?: RegisterOptions<T, Id<T>>;
};

const useRegisterInput = <T>(
  formKey: 'youthApplication' | 'additionalInfo'
): ((id: Id<T>, registerOptions?: RegisterOptions<T>) => InputProps<T>) => {
  const { t } = useTranslation();
  const { formState } = useFormContext<T>();

  const getErrorText = (id: Id<T>): string | undefined => {
    const error = get(formState.errors, id) as FieldError | undefined;
    const errorType = error?.type;
    return errorType ? t(`common:errors.${errorType}`) : undefined;
  };
  return (id, registerOptions) => ({
    id,
    errorText: getErrorText(id),
    label: t(`common:${formKey}.form.${id as string}`),
    registerOptions,
  });
};

export default useRegisterInput;
