import { DEFAULT_LANGUAGE, Language } from '@frontend/shared/src/i18n/i18n';
import AdditionalInfoApplication from 'kesaseteli-shared/types/additional-info-application';
import AdditionalInfoFormData from 'kesaseteli-shared/types/additional-info-form-data';
import AdditionalInfoReasonOption from 'kesaseteli-shared/types/additional-info-reason-option';

export const convertFormDataToApplication = (
  additionalInfoFormData: AdditionalInfoFormData,
  language?: Language
): AdditionalInfoApplication => {
  const { additional_info_user_reasons, ...formData } = additionalInfoFormData;
  return {
    ...formData,
    additional_info_user_reasons: additional_info_user_reasons.map(
      (reason: AdditionalInfoReasonOption) => reason.name
    ),
    language: language ?? DEFAULT_LANGUAGE,
  };
};
