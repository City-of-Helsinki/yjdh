import axios from 'axios';
import { TFunction } from 'next-i18next';

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
