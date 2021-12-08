import SelectedSchoolFormData from 'kesaseteli/youth/types/selected-school-form-data';
import UnlistedSchoolFormData from 'kesaseteli/youth/types/unlisted-school-form-data';
import YouthApplication from 'kesaseteli/youth/types/youth-application';
import { DEFAULT_LANGUAGE, Language } from 'shared/i18n/i18n';

type YouthFormData = SelectedSchoolFormData | UnlistedSchoolFormData;

export const hasUnlistedSchool = (
  youthFormData: YouthFormData
): youthFormData is UnlistedSchoolFormData => youthFormData.is_unlisted_school;

export const convertFormDataToApplication = (
  youthFormData: YouthFormData,
  language?: Language
): YouthApplication => ({
  ...youthFormData,
  school: hasUnlistedSchool(youthFormData)
    ? youthFormData.unlisted_school
    : youthFormData.selected_school?.name,
  is_unlisted_school: Boolean(youthFormData.is_unlisted_school),
  language: language ?? DEFAULT_LANGUAGE,
});
