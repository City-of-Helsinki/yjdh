import {
  ButtonPresetTheme,
  ButtonSize,
  ButtonVariant,
  IconPlus,
  IconSpeechbubbleText,
  IconTrash,
  RadioButton,
} from 'hds-react';
import { useTranslation } from 'next-i18next';
import React, { useRef, useState } from 'react';
import Button from 'shared/components/button/Button';
import showErrorToast from 'shared/components/toast/show-error-toast';
import showSuccessToast from 'shared/components/toast/show-success-toast';
import {
  ATTACHMENT_CONTENT_TYPES,
  ATTACHMENT_MAX_SIZE,
} from 'shared/constants/attachment-constants';
import useMediaQuery from 'shared/hooks/useMediaQuery';
import type {
  AttachmentContentType,
  AttachmentType,
  KesaseteliAttachment,
} from 'shared/types/attachment';
import { convertToUIDateAndTimeFormat } from 'shared/utils/date.utils';
import { useTheme } from 'styled-components';

import useDeleteAttachmentMutation from '../../hooks/backend/useDeleteAttachmentMutation';
import useOpenAttachment from '../../hooks/backend/useOpenAttachment';
import useUploadAttachmentQuery from '../../hooks/backend/useUploadAttachmentQuery';
import { isHandledEmployerApplicationStatus } from '../../types/application';
import type HandlerEmployerApplication from '../../types/HandlerEmployerApplication';
import AttachmentCommentsDialog from './AttachmentCommentsDialog';
import DeleteAttachmentDialog from './DeleteAttachmentDialog';
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

const ERROR_ATTACHMENTS_TITLE = 'common:error.attachments.title';

const findVoucherIdForAttachment = (
  application: HandlerEmployerApplication,
  attachmentId: string
): string =>
  application.summer_vouchers.find((v) =>
    v.attachments?.some((a) => a.id === attachmentId)
  )?.id ?? '';

const validateAttachmentFile = (
  file: File,
  t: (key: string) => string
): boolean => {
  if (!ATTACHMENT_CONTENT_TYPES.includes(file.type as AttachmentContentType)) {
    showErrorToast(
      t(ERROR_ATTACHMENTS_TITLE),
      t('common:error.attachments.fileType')
    );
    return false;
  }
  if (file.size > ATTACHMENT_MAX_SIZE) {
    showErrorToast(
      t(ERROR_ATTACHMENTS_TITLE),
      t('common:error.attachments.tooBig')
    );
    return false;
  }
  return true;
};

const getTableColSpan = (isMobile: boolean, canDelete: boolean): number => {
  if (isMobile) return canDelete ? 4 : 3;
  return canDelete ? 6 : 5;
};

type AttachmentInputAreaProps = {
  attachmentType: AttachmentType;
  setAttachmentType: (type: AttachmentType) => void;
  isMultiVoucher: boolean;
  isMobile: boolean;
  isDragging: boolean;
  isUploading: boolean;
  uploadRef: React.RefObject<HTMLInputElement | null>;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const AttachmentInputArea: React.FC<AttachmentInputAreaProps> = ({
  attachmentType,
  setAttachmentType,
  isMultiVoucher,
  isMobile,
  isDragging,
  isUploading,
  uploadRef,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileInputChange,
}) => {
  const { t } = useTranslation();

  return (
    <>
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
          onDragOver={onDragOver}
          onDragEnter={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
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
          {isUploading
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
          onChange={onFileInputChange}
        />
        <Button
          id="attachment-upload-button"
          onClick={() => uploadRef.current?.click()}
          isLoading={isUploading}
          loadingText={t('common:upload.isUploading')}
          iconStart={<IconPlus />}
          theme={ButtonPresetTheme.Coat}
        >
          {isMobile
            ? t('common:handlerApplication.attachmentsInputPlaceholderMobile')
            : t('common:handlerApplication.attachmentsInputPlaceholderDesktop')}
        </Button>
      </$PlaceholderInputArea>
    </>
  );
};

type AttachmentTableProps = {
  attachments: KesaseteliAttachment[];
  isMobile: boolean;
  canDeleteAttachments: boolean;
  isDeleting: boolean;
  deletingAttachmentId?: string;
  onOpenAttachment: (attachment: KesaseteliAttachment) => void;
  onOpenComments: (attachment: KesaseteliAttachment) => void;
  onDeleteAttachment: (attachment: KesaseteliAttachment) => void;
};

const AttachmentTable: React.FC<AttachmentTableProps> = ({
  attachments,
  isMobile,
  canDeleteAttachments,
  isDeleting,
  deletingAttachmentId,
  onOpenAttachment,
  onOpenComments,
  onDeleteAttachment,
}) => {
  const { t } = useTranslation();
  const hasAttachments = attachments.length > 0;
  const viewCommentsLabel = t(
    'common:handlerApplication.viewAttachmentComments'
  );

  return (
    <$TableWrapper>
      <$Table>
        {/* Visually hidden caption for screen readers to describe the table content */}
        <caption>{t('common:handlerApplication.attachmentsTitle')}</caption>
        <thead>
          <tr>
            <th>{t('common:handlerApplication.attachmentName')}</th>
            <th>{t('common:handlerApplication.attachmentType')}</th>
            {isMobile && (
              <th
                aria-label={t('common:handlerApplication.attachmentComments')}
              />
            )}
            {!isMobile && (
              <>
                <th>{t('common:handlerApplication.attachmentAddedBy')}</th>
                <th>{t('common:handlerApplication.attachmentAddedAt')}</th>
                <th>{t('common:handlerApplication.attachmentComments')}</th>
              </>
            )}
            {canDeleteAttachments && (
              <th aria-label={t('common:common.delete')} />
            )}
          </tr>
        </thead>
        <tbody>
          {hasAttachments ? (
            attachments.map((attachment) => (
              <tr key={attachment.id} id={`attachment-${attachment.id}`}>
                <td>
                  <$AttachmentLink onClick={() => onOpenAttachment(attachment)}>
                    {attachment.attachment_file_name}
                  </$AttachmentLink>
                </td>
                <td>
                  {attachment.attachment_type === 'employment_contract'
                    ? t('common:handlerApplication.employment_contract')
                    : t('common:handlerApplication.payslip')}
                </td>
                {isMobile && (
                  <td>
                    <Button
                      variant={ButtonVariant.Supplementary}
                      size={ButtonSize.Small}
                      iconStart={<IconSpeechbubbleText aria-hidden />}
                      onClick={() => onOpenComments(attachment)}
                      data-testid={`attachment-comments-button-mobile-${attachment.id}`}
                      aria-label={viewCommentsLabel}
                      title={viewCommentsLabel}
                    >
                      {attachment.notes_count
                        ? String(attachment.notes_count)
                        : null}
                    </Button>
                  </td>
                )}
                {!isMobile && (
                  <>
                    <td>{t('common:handlerApplication.attachmentUploaded')}</td>
                    <td>
                      {convertToUIDateAndTimeFormat(attachment.created_at)}
                    </td>
                    <td>
                      <Button
                        variant={ButtonVariant.Supplementary}
                        size={ButtonSize.Small}
                        iconStart={<IconSpeechbubbleText aria-hidden />}
                        onClick={() => onOpenComments(attachment)}
                        data-testid={`attachment-comments-button-${attachment.id}`}
                        aria-label={viewCommentsLabel}
                        title={viewCommentsLabel}
                      >
                        {attachment.notes_count
                          ? String(attachment.notes_count)
                          : null}
                      </Button>
                    </td>
                  </>
                )}
                {canDeleteAttachments && (
                  <td>
                    <Button
                      variant={ButtonVariant.Supplementary}
                      size={ButtonSize.Small}
                      iconStart={
                        <IconTrash color="var(--color-brick)" aria-hidden />
                      }
                      onClick={() => onDeleteAttachment(attachment)}
                      isLoading={
                        isDeleting && deletingAttachmentId === attachment.id
                      }
                      data-testid={`delete-attachment-button-${attachment.id}`}
                      aria-label={t('common:dialog.deleteAttachment')}
                      title={t('common:dialog.deleteAttachment')}
                    >
                      {t('common:common.delete')}
                    </Button>
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={getTableColSpan(isMobile, canDeleteAttachments)}>
                {t('common:handlerApplication.noAttachments')}
              </td>
            </tr>
          )}
        </tbody>
      </$Table>
    </$TableWrapper>
  );
};

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

  const deleteMutation = useDeleteAttachmentMutation();
  const [deleteTargetAttachment, setDeleteTargetAttachment] =
    useState<KesaseteliAttachment | null>(null);
  const [commentsTargetAttachment, setCommentsTargetAttachment] =
    useState<KesaseteliAttachment | null>(null);

  const canDeleteAttachments = !isHandledEmployerApplicationStatus(
    application.status
  );

  const uploadVoucherId = application.summer_vouchers[0]?.id;

  const buildFormData = (file: File): FormData => {
    const fd = new FormData();
    fd.append('attachment_type', attachmentType);
    fd.append('attachment_file', file);
    return fd;
  };

  const validateAndUpload = (file: File): void => {
    if (!validateAttachmentFile(file, t)) return;
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

  const handleDeleteConfirm = (): void => {
    if (!deleteTargetAttachment) return;
    const voucherId = findVoucherIdForAttachment(
      application,
      deleteTargetAttachment.id
    );
    deleteMutation.mutate(
      {
        voucherId,
        applicationId: application.id,
        attachmentId: deleteTargetAttachment.id,
      },
      {
        onSuccess: () => {
          setDeleteTargetAttachment(null);
          showSuccessToast(t('common:dialog.deleteAttachmentSuccess'), '');
        },
        onError: () => {
          showErrorToast(
            t(ERROR_ATTACHMENTS_TITLE),
            t('common:dialog.deleteAttachmentError')
          );
          setDeleteTargetAttachment(null);
        },
      }
    );
  };

  const isMultiVoucher = application.summer_vouchers.length > 1;

  return (
    <$AttachmentsContainer>
      <AttachmentInputArea
        attachmentType={attachmentType}
        setAttachmentType={setAttachmentType}
        isMultiVoucher={isMultiVoucher}
        isMobile={isMobile}
        isDragging={isDragging}
        isUploading={uploadMutation.isPending}
        uploadRef={uploadRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onFileInputChange={handleFileInputChange}
      />

      <AttachmentTable
        attachments={attachments}
        isMobile={isMobile}
        canDeleteAttachments={canDeleteAttachments}
        isDeleting={deleteMutation.isPending}
        deletingAttachmentId={deleteTargetAttachment?.id}
        onOpenAttachment={openAttachment}
        onOpenComments={setCommentsTargetAttachment}
        onDeleteAttachment={setDeleteTargetAttachment}
      />

      {deleteTargetAttachment && (
        <DeleteAttachmentDialog
          attachment={deleteTargetAttachment}
          isOpen={Boolean(deleteTargetAttachment)}
          isDeleting={deleteMutation.isPending}
          onClose={() => setDeleteTargetAttachment(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}

      {commentsTargetAttachment && (
        <AttachmentCommentsDialog
          attachment={commentsTargetAttachment}
          applicationId={application.id}
          isOpen={Boolean(commentsTargetAttachment)}
          onClose={() => setCommentsTargetAttachment(null)}
        />
      )}
    </$AttachmentsContainer>
  );
};

export default EmployerApplicationAttachments;
