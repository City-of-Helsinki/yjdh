
import { ATTACHMENT_TYPES } from 'benefit-shared/constants';
import { Application } from 'benefit-shared/types/application';
import { Button, Dialog, IconUpload } from 'hds-react';
import { useTranslation } from 'next-i18next';
import React, { useState, useRef } from 'react';
import { showErrorToast } from 'shared/components/toast/Toast';

type Props = {
  application: Application;
  onUpload: (data: FormData) => void;
  isUploading?: boolean;
};

const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
] as const;

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const UploadAttachmentButton: React.FC<Props> = ({
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
    if (!file) return;

    const fileSize = file.size;

    // Validate file extension
    if (!ALLOWED_FILE_TYPES.includes(file.type as typeof ALLOWED_FILE_TYPES[number])) {
      showErrorToast(
        t('common:applications.errors.fileUpload.title'),
        t('common:applications.errors.fileUpload.fileTypeError')
      );
      if (uploadRef.current) {
        uploadRef.current.value = '';
      }
      return;
    }

    // Validate file size
    if (fileSize > MAX_FILE_SIZE) {
      showErrorToast(
        t('common:applications.errors.fileUpload.title'),
        t('common:applications.errors.fileUpload.fileSizeError')
      );
      if (uploadRef.current) {
        uploadRef.current.value = '';
      }
      return;
    }

    const formData = new FormData();
    formData.append('attachment_type', ATTACHMENT_TYPES.PAYSLIP);
    formData.append('attachment_file', file);

    onUpload(formData);

    // Reset input
    if (uploadRef.current) {
      uploadRef.current.value = '';
    }

    setIsDialogOpen(false);
  };

  return (
    <>
      <Button
        theme="black"
        variant="secondary"
        iconLeft={<IconUpload />}
        onClick={() => setIsDialogOpen(true)}
        disabled={isUploading}
      >
        Lataa liite
      </Button>

      <Dialog
        isOpen={isDialogOpen}
        close={() => setIsDialogOpen(false)}
        aria-labelledby="upload-dialog-title"
        closeButtonLabelText={t('common:applications.paidSalaries.buttons.close')}
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
            disabled={isUploading}
            iconLeft={<IconUpload />}
            style={{ marginTop: '1rem' }}
          >
            {isUploading ? 'Ladataan...' : 'Valitse tiedosto'}
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
