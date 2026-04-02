import { useTranslation } from 'next-i18next';
import {
  FieldValues,
  get,
  RegisterOptions,
  useFormContext,
  useFormState,
} from 'react-hook-form';
import Id from 'shared/types/id';

type InputProps<T extends FieldValues> = {
  id: Id<T>;
  errorText?: string;
  label: string;
  registerOptions?: RegisterOptions<T, Id<T>>;
};

const useRegisterInput = <T extends FieldValues>(
  formKey: 'youthApplication' | 'additionalInfo'
): ((id: Id<T>, registerOptions?: RegisterOptions<T>) => InputProps<T>) => {
  const { t } = useTranslation();
  const { control } = useFormContext<T>();
  const { errors } = useFormState<T>({ control });

  const getErrorText = (id: Id<T>): string | undefined => {
    const error = get(errors, id);
    const errorType: string | undefined = error?.type;
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
