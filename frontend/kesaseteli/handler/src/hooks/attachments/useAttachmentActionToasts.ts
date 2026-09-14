import { useTranslation } from 'next-i18next';
import showErrorToast from 'shared/components/toast/show-error-toast';
import showSuccessToast from 'shared/components/toast/show-success-toast';

import { getAttachmentUploadErrorMessage } from '../../utils/attachment.utils';

const ERROR_ATTACHMENTS_TITLE = 'common:error.attachments.title';

export type AttachmentActionCallbacks = {
  onSuccess: () => void;
  onError: (error?: unknown) => void;
  onSettled?: () => void;
};

const useAttachmentActionToasts = (): {
  getUploadCallbacks: () => AttachmentActionCallbacks;
  getDeleteCallbacks: (onSettled?: () => void) => AttachmentActionCallbacks;
} => {
  const { t } = useTranslation();

  const getUploadCallbacks = (): AttachmentActionCallbacks => ({
    onSuccess: () => {
      showSuccessToast(
        t('common:handlerApplication.attachmentsUploadSuccess'),
        ''
      );
    },
    onError: (error: unknown) => {
      const errorMessage = getAttachmentUploadErrorMessage(error, t);
      showErrorToast(t(ERROR_ATTACHMENTS_TITLE), errorMessage);
    },
  });

  const getDeleteCallbacks = (
    onSettled?: () => void
  ): AttachmentActionCallbacks => ({
    onSuccess: () => {
      showSuccessToast(t('common:dialog.deleteAttachmentSuccess'), '');
    },
    onError: () => {
      showErrorToast(
        t(ERROR_ATTACHMENTS_TITLE),
        t('common:dialog.deleteAttachmentError')
      );
    },
    onSettled,
  });

  return { getUploadCallbacks, getDeleteCallbacks };
};

export default useAttachmentActionToasts;
