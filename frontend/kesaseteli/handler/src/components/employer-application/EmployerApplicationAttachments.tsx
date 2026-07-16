import { IconPlus, RadioButton } from 'hds-react';
import { useTranslation } from 'next-i18next';
import React, { useRef, useState } from 'react';
import Button from 'shared/components/button/Button';
import showErrorToast from 'shared/components/toast/show-error-toast';
import {
  ATTACHMENT_CONTENT_TYPES,
  ATTACHMENT_MAX_SIZE,
} from 'shared/constants/attachment-constants';
import useMediaQuery from 'shared/hooks/useMediaQuery';
import { AttachmentContentType, AttachmentType } from 'shared/types/attachment';
import { convertToUIDateAndTimeFormat } from 'shared/utils/date.utils';
import { useTheme } from 'styled-components';

import useOpenAttachment from '../../hooks/backend/useOpenAttachment';
import useUploadAttachmentQuery from '../../hooks/backend/useUploadAttachmentQuery';
import type HandlerEmployerApplication from '../../types/HandlerEmployerApplication';
import {
  $AttachmentLink,
  $AttachmentsContainer,
  $AttachmentTypeGroup,
  $DragDropArea,
  $HiddenFileInput,
  $MultiVoucherWarning,
  $PlaceholderInputArea,
  $Table,
  $TableWrapper,
} from './EmployerApplicationAttachments.sc';

type Props = {
  application: HandlerEmployerApplication;
};

const EmployerApplicationAttachments: React.FC<Props> = ({ application }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.m})`);
  const openAttachment = useOpenAttachment();
  const uploadMutation = useUploadAttachmentQuery();

  const uploadRef = useRef<HTMLInputElement>(null);
  const [attachmentType, setAttachmentType] = useState<AttachmentType>(
    'employment_contract'
  );
  const [isDragging, setIsDragging] = useState(false);

  const uploadVoucherId = application.summer_vouchers[0]?.id;

  const buildFormData = (file: File): FormData => {
    const fd = new FormData();
    fd.append('attachment_type', attachmentType);
    fd.append('attachment_file', file);
    return fd;
  };

  const validateAndUpload = (file: File): void => {
    if (
      !ATTACHMENT_CONTENT_TYPES.includes(file.type as AttachmentContentType)
    ) {
      showErrorToast(
        t('common:error.attachments.title'),
        t('common:error.attachments.fileType')
      );
      return;
    }
    if (file.size > ATTACHMENT_MAX_SIZE) {
      showErrorToast(
        t('common:error.attachments.title'),
        t('common:error.attachments.tooBig')
      );
      return;
    }
    if (!uploadVoucherId) return;
    uploadMutation.mutate({
      summer_voucher: uploadVoucherId,
      applicationId: application.id,
      data: buildFormData(file),
    });
  };

  const handleFileInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const file = e.target.files?.[0];
    if (file) validateAndUpload(file);
    if (uploadRef.current) uploadRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) validateAndUpload(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (): void => {
    setIsDragging(false);
  };

  const attachments = application.summer_vouchers.flatMap(
    (voucher) => voucher.attachments || []
  );

  const hasAttachments = attachments.length > 0;
  const isMultiVoucher = application.summer_vouchers.length > 1;

  return (
    <$AttachmentsContainer>
      {/* Attachment type selection */}
      <$AttachmentTypeGroup>
        <legend>{t('common:handlerApplication.attachmentType')}</legend>
        <RadioButton
          id="attachment-type-employment-contract"
          name="attachment-type"
          label={t('common:handlerApplication.employment_contract')}
          value="employment_contract"
          checked={attachmentType === 'employment_contract'}
          onChange={() => setAttachmentType('employment_contract')}
        />
        <RadioButton
          id="attachment-type-payslip"
          name="attachment-type"
          label={t('common:handlerApplication.payslip')}
          value="payslip"
          checked={attachmentType === 'payslip'}
          onChange={() => setAttachmentType('payslip')}
        />
      </$AttachmentTypeGroup>

      {/* Multi-voucher warning note if applicable */}
      {isMultiVoucher && (
        <$MultiVoucherWarning>
          {t('common:handlerApplication.attachmentsUploadMultiVoucherNote')}
        </$MultiVoucherWarning>
      )}

      {/* Drag & drop area (desktop only) */}
      {!isMobile && (
        <$DragDropArea
          $isDragging={isDragging}
          onDragOver={handleDragOver}
          onDragEnter={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => uploadRef.current?.click()}
          role="button"
          tabIndex={0}
          aria-label={t(
            'common:handlerApplication.attachmentsDragAndDropPlaceholder'
          )}
          onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
            if (e.key === 'Enter' || e.key === ' ') uploadRef.current?.click();
          }}
        >
          {uploadMutation.isLoading
            ? t('common:upload.isUploading')
            : t('common:handlerApplication.attachmentsDragAndDropPlaceholder')}
        </$DragDropArea>
      )}

      {/* File picker */}
      <$PlaceholderInputArea>
        <label htmlFor="attachment-file-input">
          {isMobile
            ? t('common:handlerApplication.attachmentsInputPlaceholderMobile')
            : t('common:handlerApplication.attachmentsInputPlaceholderDesktop')}
        </label>
        <$HiddenFileInput
          id="attachment-file-input"
          ref={uploadRef}
          type="file"
          accept={ATTACHMENT_CONTENT_TYPES.join(', ')}
          onChange={handleFileInputChange}
        />
        <Button
          id="attachment-upload-button"
          onClick={() => uploadRef.current?.click()}
          isLoading={uploadMutation.isLoading}
          loadingText={t('common:upload.isUploading')}
          iconStart={<IconPlus />}
          theme="coat"
        >
          {isMobile
            ? t('common:handlerApplication.attachmentsInputPlaceholderMobile')
            : t('common:handlerApplication.attachmentsInputPlaceholderDesktop')}
        </Button>
      </$PlaceholderInputArea>

      <$TableWrapper>
        <$Table>
          {/* Visually hidden caption for screen readers to describe the table content */}
          <caption>{t('common:handlerApplication.attachmentsTitle')}</caption>
          <thead>
            <tr>
              <th>{t('common:handlerApplication.attachmentName')}</th>
              <th>{t('common:handlerApplication.attachmentType')}</th>
              {!isMobile && (
                <>
                  <th>{t('common:handlerApplication.attachmentAddedBy')}</th>
                  <th>{t('common:handlerApplication.attachmentAddedAt')}</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {hasAttachments ? (
              attachments.map((attachment) => (
                <tr key={attachment.id}>
                  <td>
                    <$AttachmentLink onClick={() => openAttachment(attachment)}>
                      {attachment.attachment_file_name}
                    </$AttachmentLink>
                  </td>
                  <td>
                    {attachment.attachment_type === 'employment_contract'
                      ? t('common:handlerApplication.employment_contract')
                      : t('common:handlerApplication.payslip')}
                  </td>
                  {!isMobile && (
                    <>
                      <td>
                        {t('common:handlerApplication.attachmentUploaded')}
                      </td>
                      <td>
                        {convertToUIDateAndTimeFormat(attachment.created_at)}
                      </td>
                    </>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={isMobile ? 2 : 4}>
                  {t('common:handlerApplication.noAttachments')}
                </td>
              </tr>
            )}
          </tbody>
        </$Table>
      </$TableWrapper>
    </$AttachmentsContainer>
  );
};

export default EmployerApplicationAttachments;
