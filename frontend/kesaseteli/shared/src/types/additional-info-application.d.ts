import AdditionalInfoReasonType from 'kesaseteli-shared/types/additional-info-reason-type';

import AdditionalInfoFormData from './additional-info-form-data';

type AdditionalInfoApplication = Omit<
  AdditionalInfoFormData,
  'additional_info_user_reasons'
> & {
  additional_info_user_reasons: AdditionalInfoReasonType[];
};

export default AdditionalInfoApplication;
