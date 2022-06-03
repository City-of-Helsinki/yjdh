import Attachment, {
  BenefitAttachment,
  KesaseteliAttachment,
} from '../types/attachment';

export const isKesaseteliAttachment = (
  attachment: unknown
): attachment is KesaseteliAttachment =>
  Boolean(
    attachment &&
      typeof attachment === 'object' &&
      'summer_voucher' in attachment
  );

export const isBenefitAttachment = (
  attachment: unknown
): attachment is BenefitAttachment =>
  Boolean(
    attachment &&
      typeof attachment === 'object' &&
      !('summer_voucher' in attachment)
  );

export const getAttachmentsByType = <T extends Attachment>(
  attachments: T[],
  type: string
): T[] =>
  attachments?.filter(
    (attachment) =>
      (isKesaseteliAttachment(attachment) &&
        attachment.attachment_type === type) ||
      (isBenefitAttachment(attachment) && attachment.attachmentType === type)
  ) ?? [];

export const getAttachmentsSummary = <T extends Attachment>(
  attachments?: T[]
): string =>
  attachments
    ?.map(
      (attachment) =>
        (isKesaseteliAttachment(attachment) &&
          attachment.attachment_file_name) ||
        (isBenefitAttachment(attachment) && attachment.attachmentFileName) ||
        undefined
    )
    .join(', ') ?? '-';
