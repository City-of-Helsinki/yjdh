import { BackendEndpoint } from 'kesaseteli/employer/backend-api/backend-api';
import useApplicationApi from 'kesaseteli/employer/hooks/application/useApplicationApi';
import useApplicationFormField from 'kesaseteli/employer/hooks/application/useApplicationFormField';
import useBackendAPI from 'kesaseteli/employer/hooks/backend/useBackendAPI';
import useRemoveAttachmentQuery from 'kesaseteli/employer/hooks/backend/useRemoveAttachmentQuery';
import useUploadAttachmentQuery from 'kesaseteli/employer/hooks/backend/useUploadAttachmentQuery';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import AttachmentsListBase from 'shared/components/attachments/AttachmentsList';
import showErrorToast from 'shared/components/toast/show-error-toast';
import Attachment, { AttachmentType } from 'shared/types/attachment';
import Employment from 'shared/types/employment';

type Props = {
  index: number;
  attachmentType: AttachmentType;
};

const AttachmentInput: React.FC<Props> = ({ index, attachmentType }) => {
  const { t } = useTranslation();

  const { getValue: getEmployment } = useApplicationFormField<Employment>(
    `summer_vouchers.${index}`
  );
  const { id: summerVoucherId, attachments } = getEmployment() as Employment;
  const { applicationId } = useApplicationApi();
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

  const handleRemove = React.useCallback(
    (attachmentId: string): void => {
      removeAttachment({
        summer_voucher: summerVoucherId,
        id: attachmentId,
      });
    },
    [removeAttachment, summerVoucherId]
  );

  const handleUpload = React.useCallback(
    (attachment: FormData): void => {
      uploadAttachment({
        summer_voucher: summerVoucherId,
        data: attachment,
      });
    },
    [uploadAttachment, summerVoucherId]
  );

  const { axios, handleResponse } = useBackendAPI();

  const openAttachment = React.useCallback(
    async ({ id, summer_voucher, content_type }: Attachment) => {
      const data = await handleResponse<Blob>(
        axios.get(
          `${BackendEndpoint.SUMMER_VOUCHERS}${summer_voucher}${BackendEndpoint.ATTACHMENTS}${id}`,
          { responseType: 'blob' }
        )
      );
      if (data instanceof Blob) {
        const file = new Blob([data], { type: content_type });
        const fileURL = URL.createObjectURL(file);
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        const newTab = window.open(fileURL, '_blank');
        if (newTab) {
          newTab.focus();
        }
      }
    },
    [axios, handleResponse]
  );

  React.useEffect(() => {
    if (isRemovingError) {
      showErrorToast(
        t(`common:remove.errorTitle`),
        t(`common:remove.errorMessage`)
      );
    } else if (isUploadingError) {
      showErrorToast(
        t(`common:upload.errorTitle`),
        t(`common:upload.errorMessage`)
      );
    }
  }, [isRemovingError, isUploadingError, t]);

  return (
    <AttachmentsListBase
      title={t(
        `common:applications.sections.attachments.types.${attachmentType}.title`
      )}
      attachmentType={attachmentType}
      attachments={attachments}
      onUpload={handleUpload}
      onRemove={handleRemove}
      onOpen={openAttachment}
      isUploading={isUploading}
      isRemoving={isRemoving}
    />
  );
};

export default AttachmentInput;
