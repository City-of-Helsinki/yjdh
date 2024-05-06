import type {
  Control,
  ErrorOption,
  FieldError,
  UseFormRegister,
} from 'react-hook-form';
import type { Language } from 'shared/i18n/i18n';

export type ApplicationWithoutSsn = {
  firstName: string;
  lastName: string;
  email: string;
  school: string;
  phoneNumber: string;
  postcode: string;
  language: Language;
  nonVtjBirthdate: string;
  nonVtjHomeMunicipality?: string;
  additionalInfoDescription: string;
};

export type BackendApplicationWithoutSsn = {
  first_name: ApplicationWithoutSsn['firstName'];
  last_name: ApplicationWithoutSsn['lastName'];
  email: ApplicationWithoutSsn['email'];
  school: ApplicationWithoutSsn['school'];
  phone_number: ApplicationWithoutSsn['phoneNumber'];
  postcode: ApplicationWithoutSsn['postcode'];
  language: ApplicationWithoutSsn['language'];
  non_vtj_birthdate: ApplicationWithoutSsn['nonVtjBirthdate'];
  non_vtj_home_municipality?: ApplicationWithoutSsn['nonVtjHomeMunicipality'];
  additional_info_description: ApplicationWithoutSsn['additionalInfoDescription'];
};

type BackendField = keyof BackendApplicationWithoutSsn;

type CamelCase<S extends string> = S extends `${infer P}_${infer Q}`
  ? `${Lowercase<P>}${Capitalize<CamelCase<Q>>}`
  : S;

export type FrontendToBackendField = {
  [K in BackendField as CamelCase<K>]: K;
};

export type BackendToFrontendField = {
  [K in keyof FrontendToBackendField as FrontendToBackendField[K]]: K;
};

export type ApplicationWithoutSsnFormData = ApplicationWithoutSsn;

export type ApplicationWithoutSsnFieldName = keyof ApplicationWithoutSsn;

export type ApplicationWithoutSsnFieldPath = NonNullable<
  Parameters<UseFormRegister<ApplicationWithoutSsnFormData>>[0]
>;

export type ApplicationWithoutSsnValue =
  ApplicationWithoutSsn[keyof ApplicationWithoutSsn];

/**
 * TODO: YJDH-701, refactor to reduce code duplication, modified from ApplicationFormField:
 *       frontend/kesaseteli/employer/src/hooks/application/useApplicationFormField.ts
 */
export type ApplicationWithoutSsnFormField<
  V extends ApplicationWithoutSsnValue
> = {
  control: Control<ApplicationWithoutSsn>;
  register: UseFormRegister<ApplicationWithoutSsn>;
  fieldName: ApplicationWithoutSsnFieldName;
  defaultLabel: string;
  getValue: () => V;
  watch: () => V;
  setValue: (value: V) => void;
  getError: () => FieldError | undefined;
  hasError: () => boolean;
  getErrorText: () => string | undefined;
  setError: (error: ErrorOption) => void;
  clearValue: () => void;
  trigger: () => Promise<boolean>;
  clearErrors: () => void;
  setFocus: () => void;
};
