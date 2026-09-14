import axios from 'axios';
import { TFunction } from 'next-i18next';
import { AttachmentType } from 'shared/types/attachment';

/**
 * Extracts a human-readable error message from an attachment upload failure.
 *
 * It checks the Django REST Framework response for standard field errors like
 * `non_field_errors`, `detail`, or specifically `attachment_file` errors, and
 * returns the first one it finds. If no specific error is found, it falls back
 * to a generic translation.
 */
export const getAttachmentUploadErrorMessage = (
  error: unknown,
  t: TFunction
): string => {
  if (axios.isAxiosError(error) && error.response?.data) {
    const data = error.response.data as Record<string, unknown>;

    if (
      Array.isArray(data.non_field_errors) &&
      data.non_field_errors.length > 0 &&
      typeof data.non_field_errors[0] === 'string'
    ) {
      return data.non_field_errors[0];
    }

    if (typeof data.detail === 'string') {
      return data.detail;
    }

    if (
      Array.isArray(data.attachment_file) &&
      data.attachment_file.length > 0 &&
      typeof data.attachment_file[0] === 'string'
    ) {
      return data.attachment_file[0];
    }
  }

  return t('common:error.attachments.generic');
};

/**
 * Constructs a `FormData` object required by the backend to upload an attachment.
 *
 * Both Employer and Youth applications use the same underlying endpoint format for uploads,
 * which requires the file itself (`attachment_file`). Employer applications additionally
 * require the attachment classification (`attachment_type`).
 */
export const buildAttachmentFormData = (
  file: File,
  attachmentType?: AttachmentType
): FormData => {
  const fd = new FormData();
  if (attachmentType) {
    fd.append('attachment_type', attachmentType);
  }
  fd.append('attachment_file', file);
  return fd;
};
