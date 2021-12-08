import { DEFAULT_LANGUAGE, Language } from '@frontend/shared/src/i18n/i18n';

import YouthApplication from '../types/youth-application';
import YouthFormData from '../types/youth-form-data';

export const convertFormDataToApplication = (
  youthFormData: YouthFormData,
  language?: Language
): YouthApplication => {
  const {
    unlisted_school,
    selected_school,
    is_unlisted_school,
    termsAndConditions,
    ...formData
  } = youthFormData;
  return {
    ...formData,
    school: unlisted_school || selected_school?.name,
    is_unlisted_school: Boolean(is_unlisted_school),
    language: language ?? DEFAULT_LANGUAGE,
  };
};
