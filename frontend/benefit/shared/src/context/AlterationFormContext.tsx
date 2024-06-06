import { AxiosError } from 'axios';
import { ApplicationAlteration } from 'benefit-shared/types/application';
import { FormikProps } from 'formik';
import { TFunction } from 'next-i18next';
import React from 'react';
import { Language } from 'shared/i18n/i18n';

export type AlterationFormContextType = {
  t: TFunction;
  formik: FormikProps<Partial<ApplicationAlteration>>;
  language: Language;
  isSubmitted: boolean;
  handleSubmit: (e: React.MouseEvent<HTMLButtonElement>) => void;
  error: AxiosError;
  isSubmitting: boolean;
};

const AlterationFormContext = React.createContext<AlterationFormContextType>({
  t: null,
  formik: null,
  language: 'fi',
  isSubmitted: false,
  handleSubmit: null,
  error: null,
  isSubmitting: false,
});

export default AlterationFormContext;
