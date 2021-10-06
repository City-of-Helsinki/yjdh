export interface UploadAttachmentData {
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
  attachmentType: string;
  attachmentFile: string;
  attachmentFileName: string;
  contentType: ATTACHMENT_CONTENT_TYPES;
  createdAt?: string;
};

export default Attachment;
