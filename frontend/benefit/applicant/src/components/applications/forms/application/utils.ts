import { Application } from 'benefit-shared/types/application';
import { FormikErrors, FormikTouched } from 'formik';

export const getTouchedAndInvalidFields = (
  touched: FormikTouched<Partial<Application>>,
  errors: FormikErrors<Partial<Application>>
): string[] =>
  Object.keys(touched).filter((field) => Object.keys(errors).includes(field));
