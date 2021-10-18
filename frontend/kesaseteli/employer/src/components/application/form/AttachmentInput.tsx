import useApplicationFormField from 'kesaseteli/employer/hooks/application/useApplicationFormField';
import useOpenAttachment from 'kesaseteli/employer/hooks/backend/useOpenAttachment';
import useRemoveAttachmentQuery from 'kesaseteli/employer/hooks/backend/useRemoveAttachmentQuery';
import useUploadAttachmentQuery from 'kesaseteli/employer/hooks/backend/useUploadAttachmentQuery';
import isEmpty from 'lodash/isEmpty';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import { useFormContext, UseFormRegister } from 'react-hook-form';
import AttachmentsListBase from 'shared/components/attachments/AttachmentsList';
import showErrorToast from 'shared/components/toast/show-error-toast';
import Application from 'shared/types/application-form-data';
import Attachment, { AttachmentType } from 'shared/types/attachment';
import { validateAttachments } from 'shared/utils/attachment.utils';

type Props = {
  index: number;
  id: NonNullable<Parameters<UseFormRegister<Application>>[0]>;
  required?: boolean;
};

const AttachmentInput: React.FC<Props> = ({ index, id, required }) => {
  const { t } = useTranslation();

  const { register } = useFormContext<Application>();

  const {
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

  const { getValue: getId } = useApplicationFormField<string>(
    `summer_vouchers.${index}.id`
  );
  const summerVoucherId = getId();

  const { mutateAsync: removeAttachment, isLoading: isRemoving } =
    useRemoveAttachmentQuery();

  const { mutateAsync: uploadAttachment, isLoading: isUploading } =
    useUploadAttachmentQuery();

  const handleRemove = React.useCallback(
    async (attachmentId: string): Promise<void> => {
      try {
        await removeAttachment({
          summer_voucher: summerVoucherId,
          id: attachmentId,
        });
        const resultList = attachments.filter(
          (attachment) => attachment.id !== attachmentId
        );
        setAttachments(resultList);
        if (required && isEmpty(resultList)) {
          setError({ type: attachmentType });
        }
      } catch (error) {
        // TODO proper error handling
        // eslint-disable-next-line no-console
        console.log(error);
        showErrorToast(
          t(`common:delete.errorTitle`),
          t(`common:delete.errorMessage`)
        );
      }
    },
    [
      attachments,
      removeAttachment,
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
      try {
        const newFile = await uploadAttachment({
          summer_voucher: summerVoucherId,
          data: attachment,
        });
        setAttachments([...attachments, newFile]);
        clearErrors();
      } catch (error) {
        // TODO proper error handling
        // eslint-disable-next-line no-console
        console.log(error);
        showErrorToast(
          t(`common:upload.errorTitle`),
          t(`common:upload.errorMessage`)
        );
      }
    },
    [
      attachments,
      uploadAttachment,
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
      isUploading={isUploading}
      isRemoving={isRemoving}
      message={message}
      errorMessage={
        hasError()
          ? `${t(`common:application.form.errors.${attachmentType}`)}`
          : undefined
      }
      required={required}
    />
  );
};

export default AttachmentInput;
