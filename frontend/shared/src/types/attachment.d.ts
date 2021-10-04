
import { ATTACHMENT_CONTENT_TYPES } from 'shared/contants/attachment-constants';

export type AttachmentType = 'employment_contract' | 'payslip'

export type AttachmentContentType =
  typeof ATTACHMENT_CONTENT_TYPES[number];

export type UploadAttachmentData = {
  applicationId: string;
  data: FormData;
}

export interface RemoveAttachmentData {
  applicationId: string;
  attachmentId: string;
}

type Attachment = {
  id: string;
  application: string;
  attachmentType: AttachmentType;
  attachmentFile: string;
  attachmentFileName: string;
  contentType: AttachmentContentType;
  createdAt?: string;
};

export default Attachment;
