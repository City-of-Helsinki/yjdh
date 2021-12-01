import isEmpty from 'lodash/isEmpty';

import Attachment from '../types/attachment';

export const getAttachmentsByType = <T extends Attachment>(
  attachments: T[],
  type: string
): T[] =>
  attachments?.filter((attachment) =>
    'attachment_type' in attachment
      ? attachment.attachment_type === type
      : attachment.attachmentType === type
  ) ?? [];

export const getAttachmentsSummary = <T extends Attachment>(
  attachments?: T[]
): string =>
  attachments
    ?.map((attachment) =>
      'attachment_file_name' in attachment
        ? attachment.attachment_file_name
        : attachment.attachmentFileName
    )
    .join(', ') ?? '-';

export const validateAttachments = <T extends Attachment>(
  attachments?: T[]
): boolean => !isEmpty(attachments);
