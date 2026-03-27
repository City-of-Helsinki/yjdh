import { ATTACHMENT_TYPES } from 'benefit-shared/constants';
import { Button, Dialog, IconUpload } from 'hds-react';
import { useTranslation } from 'next-i18next';
import React, { useRef, useState } from 'react';
import showErrorToast from 'shared/components/toast/Toast';

interface Props {
  applicationId?: string;
  onUpload: (data: FormData) => void;
  isUploading?: boolean;
}

const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
] as const;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const UploadAttachmentButton: React.FC<Props> = ({
  applicationId,
  onUpload,
  isUploading = false,
}) => {
  const { t } = useTranslation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const uploadRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = (): void => {
    uploadRef.current?.click();
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    const errorTitle = t('common:applications.errors.fileUpload.title');
    if (!file) return;

    if (!applicationId) {
      showErrorToast(
        errorTitle,
        t('common:applications.errors.fileUpload.genericError')
      );
      if (uploadRef.current) uploadRef.current.value = '';
      return;
    }

    if (
      !ALLOWED_FILE_TYPES.includes(
        file.type as typeof ALLOWED_FILE_TYPES[number]
      )
    ) {
      showErrorToast(
        errorTitle,
        t('common:applications.errors.fileUpload.fileTypeError')
      );
      if (uploadRef.current) uploadRef.current.value = '';
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      showErrorToast(
        errorTitle,
        t('common:applications.errors.fileUpload.fileSizeError')
      );
      if (uploadRef.current) uploadRef.current.value = '';
      return;
    }

    const formData = new FormData();
    formData.append('attachment_type', ATTACHMENT_TYPES.PAYSLIP);
    formData.append('attachment_file', file);

    onUpload(formData);

    if (uploadRef.current) uploadRef.current.value = '';
    setIsDialogOpen(false);
  };

  return (
    <>
      <Button
        theme="black"
        variant="secondary"
        iconLeft={<IconUpload />}
        onClick={() => setIsDialogOpen(true)}
        disabled={isUploading || !applicationId}
      >
        Lataa liite
      </Button>

      <Dialog
        isOpen={isDialogOpen}
        close={() => setIsDialogOpen(false)}
        aria-labelledby="upload-dialog-title"
        closeButtonLabelText={t(
          'common:applications.paidSalaries.buttons.close'
        )}
      >
        <Dialog.Header
          id="upload-dialog-title"
          title={t('common:applications.paidSalaries.buttons.uploadAttachment')}
        />
        <Dialog.Content>
          <p>Valitse ladattava palkkalaskelma</p>
          <p>Sallitut tiedostotyypit: PDF, PNG, JPEG</p>
          <p>Maksimi tiedostokoko: 10 MB</p>

          <input
            ref={uploadRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={handleUpload}
            style={{ display: 'none' }}
            data-testid="attachment-upload-input"
          />

          <Button
            theme="coat"
            onClick={handleUploadClick}
            disabled={isUploading || !applicationId}
            iconLeft={<IconUpload />}
            style={{ marginTop: '1rem' }}
          >
            {isUploading
              ? t('common:applications.paidSalaries.uploading')
              : t('common:applications.paidSalaries.chooseFile')}
          </Button>
        </Dialog.Content>
        <Dialog.ActionButtons>
          <Button
            theme="black"
            variant="secondary"
            onClick={() => setIsDialogOpen(false)}
          >
            Sulje
          </Button>
        </Dialog.ActionButtons>
      </Dialog>
    </>
  );
};

export default UploadAttachmentButton;
