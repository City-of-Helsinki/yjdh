import { KesaseteliAttachment } from '@frontend/shared/src/types/attachment';

import AdditionalInfoReasonOption from './additional-info-reason-option';
import CreatedYouthApplication from './created-youth-application';

type AdditionalInfoFormData = {
  id: CreatedYouthApplication['id'];
  additional_info_user_reasons: AdditionalInfoReasonOption[];
  additional_info_description: string;
  additional_info_attachments: KesaseteliAttachment[];
};

export default AdditionalInfoFormData;
