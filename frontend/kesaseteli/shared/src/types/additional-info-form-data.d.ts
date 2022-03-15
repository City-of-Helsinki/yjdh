import CreatedYouthApplication from 'kesaseteli-shared/types/created-youth-application';
import { KesaseteliAttachment } from 'shared/types/attachment';

import AdditionalInfoException from './additional-info-exception';

type AdditionalInfoFormData = Pick<
  CreatedYouthApplication,
  'id',
  'language'
> & {
  exceptionType: AdditionalInfoException;
  message: string;
  attachments: KesaseteliAttachment[];
};

export default AdditionalInfoFormData;
