import AdditionalInfoFormData from './additional-info-form-data';
import AdditionalInfoReasonType from './additional-info-reason-type';
import CreatedYouthApplication from './created-youth-application';

type AdditionalInfoApplication = Omit<
  AdditionalInfoFormData,
  'additional_info_user_reasons'
> & {
  language: CreatedYouthApplication['language'];
  additional_info_user_reasons: AdditionalInfoReasonType[];
};

export default AdditionalInfoApplication;
