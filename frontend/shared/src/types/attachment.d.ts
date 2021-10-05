import { ATTACHMENT_CONTENT_TYPES } from 'shared/contants/attachment-constants';

export type AttachmentType = 'employment_contract' | 'payslip';

export type AttachmentContentType = typeof ATTACHMENT_CONTENT_TYPES[number];

export type UploadAttachmentData = {
  applicationId: string;
  data: FormData;
};

export interface RemoveAttachmentData {
  applicationId: string;
  attachmentId: string;
}

export type BenefitAttachment = {
  id: string;
  application: string;
  attachmentType: string;
  attachmentFile: string;
  attachmentFileName: string;
  contentType: ATTACHMENT_CONTENT_TYPES;
  createdAt?: string;
};

export type KesaseteliAttachment = {
  id: string;
  application: string;
  attachment_type: AttachmentType;
  attachment_file: string;
  attachment_file_name: string;
  content_type: AttachmentContentType;
  created_at?: string;
  summer_voucher: string;
};

type Attachment = BenefitAttachment & KesaseteliAttachment;

export default Attachment;
