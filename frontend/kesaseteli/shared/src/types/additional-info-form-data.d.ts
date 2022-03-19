import CreatedYouthApplication from 'kesaseteli-shared/types/created-youth-application';
import { KesaseteliAttachment } from 'shared/types/attachment';

import AdditionalInfoReasonOption from './additional-info-reason-option';

type AdditionalInfoFormData = Pick<
  CreatedYouthApplication,
  'id',
  'language'
> & {
  additional_info_user_reasons: AdditionalInfoReasonOption[];
  additional_info_description: string;
  additional_info_attachments: KesaseteliAttachment[];
};

export default AdditionalInfoFormData;
