import isEmpty from 'lodash/isEmpty';
import Attachment from 'shared/types/attachment';

export const getAttachmentsByType = (
  attachments: Attachment[],
  type: string
): Attachment[] =>
  attachments?.filter(
    (attachment) =>
      attachment.attachment_type === type || attachment.attachmentType === type
  ) ?? [];

export const getAttachmentsSummary = (attachments?: Attachment[]): string =>
  attachments
    ?.map(
      (attachment) =>
        attachment.attachment_file_name ?? attachment.attachmentFileName
    )
    .join(', ') ?? '-';

export const validateAttachments = (attachments?: Attachment[]): boolean =>
  !isEmpty(attachments);
