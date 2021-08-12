import { useTranslation } from 'next-i18next';
import React from 'react';
import { FormProviderProps, useForm } from 'react-hook-form';
import Application from 'shared/types/employer-application';

type Props = {
  title: string,
  application: Application | undefined;
  isLoading: boolean;
  children: React.ReactNode;
};

type FormContextProps = {
  translate: (field: keyof Application) => string;
  translateError: (field: keyof Application) => string;
} & Props &
  FormProviderProps<Application>;

let ApplicationFormContext: React.Context<FormContextProps>;

export const getApplicationFormContext = (): typeof ApplicationFormContext => {
  if (!ApplicationFormContext) {
    throw new Error('ApplicationFormContext is not initialized!');
  }
  return ApplicationFormContext;
};

const setApplicationFormContext = (context: FormContextProps): void => {
  ApplicationFormContext = React.createContext<FormContextProps>(context);
};

const ApplicationForm = ({
  title,
  application,
  isLoading,
  children,
}: Props): JSX.Element => {
  const { t } = useTranslation();
  const translate = (key: keyof Application): string =>
    key ? t(`common:application.step1.form.${key}`) : key;
  const translateError = (key: keyof Application): string =>
    key ? t(`common:application.step1.form.errors.${key}`) : key;

  const methods = useForm<Application>({
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });
  const { reset, getValues } = methods;
  // https://github.com/react-hook-form/react-hook-form/issues/2492
  React.useEffect(() => {
    if (!application || isLoading) {
      return;
    }
    reset({
      ...getValues(),
      ...application,
    });
  }, [reset, application, getValues, isLoading]);

  const context = {
    translate,
    translateError,
    title,
    application,
    isLoading,
    children,
    ...methods,
  };
  setApplicationFormContext(context);

  return (
    <ApplicationFormContext.Provider value={context}>
      <form aria-label={title}>{children}</form>
    </ApplicationFormContext.Provider>
  );
};

export default ApplicationForm;
