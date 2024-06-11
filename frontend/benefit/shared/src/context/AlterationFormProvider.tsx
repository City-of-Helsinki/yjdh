import AlterationFormContext, {
  AlterationFormContextType,
} from 'benefit-shared/context/AlterationFormContext';
import React from 'react';

const AlterationFormProvider = ({
  t,
  formik,
  language,
  isSubmitted,
  isSubmitting,
  handleSubmit,
  error,
  children,
}: React.PropsWithChildren<AlterationFormContextType>): JSX.Element => (
  <AlterationFormContext.Provider
    value={{
      t,
      formik,
      language,
      isSubmitted,
      isSubmitting,
      handleSubmit,
      error,
    }}
  >
    {children}
  </AlterationFormContext.Provider>
);

export default AlterationFormProvider;
