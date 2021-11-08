import useApplicationApi from 'kesaseteli/employer/hooks/application/useApplicationApi';
import useApplicationFormField from 'kesaseteli/employer/hooks/application/useApplicationFormField';
import useOpenAttachment from 'kesaseteli/employer/hooks/backend/useOpenAttachment';
import useRemoveAttachmentQuery from 'kesaseteli/employer/hooks/backend/useRemoveAttachmentQuery';
import useUploadAttachmentQuery from 'kesaseteli/employer/hooks/backend/useUploadAttachmentQuery';
import ApplicationFieldPath from 'kesaseteli/employer/types/application-field-path';
import isEmpty from 'lodash/isEmpty';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import AttachmentsListBase from 'shared/components/attachments/AttachmentsList';
import PageLoadingSpinner from 'shared/components/pages/PageLoadingSpinner';
import showErrorToast from 'shared/components/toast/show-error-toast';
import Attachment, { AttachmentType } from 'shared/types/attachment';
import { validateAttachments } from 'shared/utils/attachment.utils';

type Props = {
  index: number;
  id: ApplicationFieldPath;
  required?: boolean;
};

const AttachmentInput: React.FC<Props> = ({ index, id, required }) => {
  const { t } = useTranslation();

  const {
    register,
    setValue: setAttachments,
    hasError,
    fieldName,
    getError,
    setError,
    watch,
    clearErrors,
  } = useApplicationFormField<Attachment[]>(id);
  const attachments = watch();

  const attachmentType = fieldName as AttachmentType;

  const { applicationQuery } = useApplicationApi<string>(
    (application) => application.summer_vouchers[index].id
  );

  const summerVoucherId = applicationQuery.isSuccess
    ? applicationQuery.data
    : undefined;

  const removeAttachmentQuery = useRemoveAttachmentQuery();

  const uploadAttachmentQuery = useUploadAttachmentQuery();

  const handleRemove = React.useCallback(
    async (attachmentId: string): Promise<void> => {
      if (!summerVoucherId) {
        throw new Error('id is missing');
      }
      removeAttachmentQuery.mutate(
        {
          summer_voucher: summerVoucherId,
          id: attachmentId,
        },
        {
          onSuccess: () => {
            const resultList = attachments.filter(
              (attachment) => attachment.id !== attachmentId
            );
            setAttachments(resultList);
            if (required && isEmpty(resultList)) {
              setError({ type: attachmentType });
            }
          },
          onError: () => {
            showErrorToast(
              t(`common:delete.errorTitle`),
              t(`common:delete.errorMessage`)
            );
          },
        }
      );
    },
    [
      attachments,
      removeAttachmentQuery,
      summerVoucherId,
      setAttachments,
      required,
      setError,
      attachmentType,
      t,
    ]
  );

  const handleUpload = React.useCallback(
    async (attachment: FormData): Promise<void> => {
      if (!summerVoucherId) {
        throw new Error('id is missing');
      }
      uploadAttachmentQuery.mutate(
        {
          summer_voucher: summerVoucherId,
          data: attachment,
        },
        {
          onSuccess: (newFile) => {
            setAttachments([...attachments, newFile]);
            clearErrors();
          },
          onError: () => {
            showErrorToast(
              t(`common:upload.errorTitle`),
              t(`common:upload.errorMessage`)
            );
          },
        }
      );
    },
    [
      attachments,
      uploadAttachmentQuery,
      summerVoucherId,
      setAttachments,
      clearErrors,
      t,
    ]
  );

  const openAttachment = useOpenAttachment();

  const { ref } = register(id, { validate: validateAttachments });

  React.useEffect(() => {
    if (hasError() && getError()?.type !== attachmentType) {
      setError({ type: attachmentType });
    }
  }, [getError, hasError, setError, attachmentType]);

  const message = `${t(
    `common:application.form.helpers.${attachmentType}`
  )} ${t(`common:application.form.helpers.attachments`)}`;

  if (applicationQuery.isSuccess) {
    return (
      <AttachmentsListBase
        buttonRef={ref}
        name={id}
        title={t(
          `common:applications.sections.attachments.types.${attachmentType}.title`
        )}
        attachmentType={attachmentType}
        attachments={attachments}
        onUpload={handleUpload}
        onRemove={handleRemove}
        onOpen={openAttachment}
        isUploading={uploadAttachmentQuery.isLoading}
        isRemoving={removeAttachmentQuery.isLoading}
        message={message}
        errorMessage={
          hasError()
            ? `${t(`common:application.form.errors.${attachmentType}`)}`
            : undefined
        }
        required={required}
      />
    );
  }
  return <PageLoadingSpinner />;
};

AttachmentInput.defaultProps = {
  required: false,
};

export default AttachmentInput;
