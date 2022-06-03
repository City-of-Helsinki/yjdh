import { DEFAULT_LANGUAGE, Language } from '@frontend/shared/src/i18n/i18n';
import YouthFormFields from 'kesaseteli-shared/types/youth-form-fields';

import YouthApplication from '../types/youth-application';
import YouthApplicationValidationError from '../types/youth-application-validation-error';
import YouthFormData from '../types/youth-form-data';

export const convertFormDataToApplication = (
  youthFormData: YouthFormData,
  language?: Language
): YouthApplication => {
  const {
    unlistedSchool,
    selectedSchool,
    is_unlisted_school,
    termsAndConditions,
    ...formData
  } = youthFormData;
  return {
    ...formData,
    school: is_unlisted_school ? unlistedSchool : selectedSchool?.name,
    is_unlisted_school: Boolean(is_unlisted_school),
    language: language ?? DEFAULT_LANGUAGE,
  };
};

export const collectErrorFieldsFromResponse = (
  responseData: YouthApplicationValidationError['response']['data'],
  is_unlisted_school: boolean
): YouthFormFields[] =>
  Object.keys(responseData).map((field) => {
    if (field === 'school' && is_unlisted_school) {
      return 'unlistedSchool';
    }
    if (field === 'school' && !is_unlisted_school) {
      return 'selectedSchool';
    }
    return field;
  }) as YouthFormFields[];
