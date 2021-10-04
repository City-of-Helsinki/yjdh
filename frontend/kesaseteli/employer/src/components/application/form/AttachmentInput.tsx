import useApplicationFormField from 'kesaseteli/employer/hooks/application/useApplicationFormField';
import useRemoveAttachmentQuery from 'kesaseteli/employer/hooks/backend/useRemoveAttachmentQuery';
import useUploadAttachmentQuery from 'kesaseteli/employer/hooks/backend/useUploadAttachmentQuery';
import camelCase from 'lodash/camelCase';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import AttachmentsListBase from 'shared/components/attachments/AttachmentsList';
import showErrorToast from 'shared/components/toast/show-error-toast';
import Attachment, { AttachmentType } from 'shared/types/attachment';
import useApplicationApi from 'kesaseteli/employer/hooks/application/useApplicationApi';
import PageLoadingSpinner from 'shared/components/pages/PageLoadingSpinner';

type Props = {
  index: number,
  attachmentType: AttachmentType;
  showMessage?: boolean;
}

const AttachmentInput: React.FC<Props> = ({
                                           index,
                                           attachmentType,
                                           showMessage,
                                         }) => {
  const { t } = useTranslation();
  const translationsBase = 'common:applications.sections.attachments';

  const { application } = useApplicationApi();
  const {id: applicationId, summer_vouchers } = application;
  const {id: summerVoucherId, attachments} = summer_vouchers[index];

  const {
    mutate: removeAttachment,
    isLoading: isRemoving,
    isError: isRemovingError,
  } = useRemoveAttachmentQuery(applicationId);

  const {
    mutate: uploadAttachment,
    isLoading: isUploading,
    isError: isUploadingError,
  } = useUploadAttachmentQuery(applicationId);


  const handleRemove = React.useCallback((attachmentId: string): void => {
    removeAttachment({
      summerVoucherId,
      attachmentId,
    });
  }, [removeAttachment, summerVoucherId]);

  const handleUpload = React.useCallback((attachment: FormData): void => {
    uploadAttachment({
      summerVoucherId,
      data: attachment,
    });
  }, [uploadAttachment, summerVoucherId]);


  React.useEffect(() => {
    if (isRemovingError || isUploadingError) {
      showErrorToast(
        t(`common:remove.errorTitle`),
        t(`common:remove.errorMessage`)
      );
    }
  }, [isRemovingError, isUploadingError, t]);



  return (
    <AttachmentsListBase
      title={t(`${translationsBase}.types.${camelCase(attachmentType)}.title`)}
      attachmentType={attachmentType}
      message={
        showMessage &&
        `${translationsBase}.types.${camelCase(attachmentType)}.message`
      }
      attachments={attachments}
      onUpload={handleUpload}
      onRemove={handleRemove}
      isUploading={isUploading}
      isRemoving={isRemoving}
    />
  );
};

const defaultProps = {
  showMessage: true,
};

AttachmentInput.defaultProps = defaultProps;

export default AttachmentInput;
