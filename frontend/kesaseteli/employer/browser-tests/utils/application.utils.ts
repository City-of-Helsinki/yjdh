import {
  EmployeeHiredWithoutVoucherAssessment,
  EmploymentExceptionReason,
} from '@frontend/kesaseteli-shared/src/types/employment';
import { KesaseteliAttachment } from '@frontend/shared/src/types/attachment';
import { getLastValue } from '@frontend/shared/src/utils/array.utils';

import translations from '../../public/locales/fi/common.json';

type SelectionGroups = typeof translations.application.form.selectionGroups;
type SelectionGroupType = keyof SelectionGroups;

export const getSelectionGroupTranslation = (
  type: SelectionGroupType,
  value:
    | EmploymentExceptionReason
    | EmployeeHiredWithoutVoucherAssessment
    | string
): string => {
  const group = translations.application.form.selectionGroups[type] as Record<
    string,
    string
  >;
  return group?.[value] ?? '';
};

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
