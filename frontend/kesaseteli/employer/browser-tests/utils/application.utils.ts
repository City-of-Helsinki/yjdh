import { KesaseteliAttachment } from '@frontend/shared/src/types/attachment';
import {
  EmployeeHiredWithoutVoucherAssessment,
  EmploymentExceptionReason,
} from '@frontend/shared/src/types/employment';
import { getLastValue } from '@frontend/shared/src/utils/array.utils';
// eslint-disable-next-line you-dont-need-lodash-underscore/get
import get from 'lodash/get';

import translations from '../../public/locales/fi/common.json';

export const getSelectionGroupTranslation = (
  type: 'summer_voucher_exception_reason' | 'hired_without_voucher_assessment',
  value: EmploymentExceptionReason | EmployeeHiredWithoutVoucherAssessment
): string =>
  get(
    translations,
    `application.form.selectionGroups.${type}.${value}`
  ) as string;

export const getAttachmentFilePath = (
  attachment: KesaseteliAttachment
): string => attachment.attachment_file_name;

export const getAttachmentFileName = (
  attachment: KesaseteliAttachment
): string => {
  const filePath = getAttachmentFilePath(attachment);
  const filename = getLastValue(filePath.split('/')) ?? filePath;
  return filename.replace(`.${getLastValue(filename.split('.')) ?? ''}`, '');
};
