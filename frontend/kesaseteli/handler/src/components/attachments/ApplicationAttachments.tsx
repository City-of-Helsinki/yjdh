import {
  ButtonPresetTheme,
  ButtonSize,
  ButtonVariant,
  IconPlus,
  IconSpeechbubbleText,
  IconTrash,
  RadioButton,
} from 'hds-react';
import useMediaQuery from 'kesaseteli/handler/hooks/useMediaQuery';
import { useTranslation } from 'next-i18next';
import React, { useRef, useState } from 'react';
import Button from 'shared/components/button/Button';
import showErrorToast from 'shared/components/toast/show-error-toast';
import {
  ATTACHMENT_CONTENT_TYPES,
  ATTACHMENT_MAX_SIZE,
} from 'shared/constants/attachment-constants';
import type {
  AttachmentContentType,
  AttachmentType,
  KesaseteliAttachment,
} from 'shared/types/attachment';
import { convertToUIDateAndTimeFormat } from 'shared/utils/date.utils';
import { useTheme } from 'styled-components';

import { useHandlerPermissions } from '../../contexts/HandlerPermissionsContext';
import type { HandlerAttachment } from '../../types/HandlerEmployerApplication';
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
  $UploadContainer,
} from './ApplicationAttachments.sc';
import AttachmentCommentsDialog from './AttachmentCommentsDialog';
import DeleteAttachmentDialog from './DeleteAttachmentDialog';

const ERROR_ATTACHMENTS_TITLE = 'common:error.attachments.title';

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
  attachmentTypes?: readonly AttachmentType[];
  attachmentType?: AttachmentType;
  setAttachmentType: (type: AttachmentType) => void;
  isMultiVoucher?: boolean;
  isMobile: boolean;
  isDragging: boolean;
  isUploading: boolean;
  disabled?: boolean;
  uploadRef: React.RefObject<HTMLInputElement | null>;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

/**
 * Renders the drag-and-drop area, file input, and optional attachment type radio buttons.
 *
 * It conditionally displays elements based on viewport size (mobile vs desktop), handles
 * the drag-and-drop state, and displays a warning note if the application has multiple vouchers.
 */
const AttachmentInputArea: React.FC<AttachmentInputAreaProps> = ({
  attachmentTypes,
  attachmentType,
  setAttachmentType,
  isMultiVoucher,
  isMobile,
  isDragging,
  isUploading,
  disabled,
  uploadRef,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileInputChange,
}) => {
  const { t } = useTranslation();
  const hasAttachmentTypes = attachmentTypes && attachmentTypes.length > 0;

  return (
    <$UploadContainer
      role="region"
      aria-label={t('common:handlerApplication.attachmentsUploadTitle')}
    >
      {/* Attachment type selection */}
      {hasAttachmentTypes && (
        <$AttachmentTypeGroup
          label={t('common:handlerApplication.attachmentsUploadTypeLabel')}
          direction="horizontal"
        >
          {attachmentTypes.map((type) => (
            <RadioButton
              key={type}
              id={`attachment-type-${type}`}
              name="attachment-type"
              label={t(`common:handlerApplication.${type}`)}
              value={type}
              checked={attachmentType === type}
              onChange={() => setAttachmentType(type)}
              disabled={disabled}
            />
          ))}
        </$AttachmentTypeGroup>
      )}

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
          $disabled={disabled}
          onDragOver={disabled ? undefined : onDragOver}
          onDragEnter={disabled ? undefined : onDragOver}
          onDragLeave={disabled ? undefined : onDragLeave}
          onDrop={disabled ? undefined : onDrop}
          onClick={() => {
            if (!disabled) uploadRef.current?.click();
          }}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-label={t(
            'common:handlerApplication.attachmentsDragAndDropPlaceholder'
          )}
          onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
            if (disabled) return;
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
          disabled={disabled}
          accept={ATTACHMENT_CONTENT_TYPES.join(', ')}
          onChange={onFileInputChange}
        />
        <Button
          id="attachment-upload-button"
          onClick={() => uploadRef.current?.click()}
          isLoading={isUploading}
          disabled={disabled || isUploading}
          loadingText={t('common:upload.isUploading')}
          iconStart={<IconPlus />}
          theme={ButtonPresetTheme.Coat}
        >
          {t('common:handlerApplication.attachmentsUploadButton', {
            defaultValue: t(
              'common:handlerApplication.attachmentsInputPlaceholderMobile'
            ),
          })}
        </Button>
      </$PlaceholderInputArea>
    </$UploadContainer>
  );
};

type AttachmentTableProps = {
  attachments: HandlerAttachment[];
  hasAttachmentTypes: boolean;
  isMobile: boolean;
  canDeleteAttachments: boolean;
  isDeleting: boolean;
  deletingAttachmentId?: string;
  onOpenAttachment: (attachment: KesaseteliAttachment) => void;
  onOpenComments: (attachment: KesaseteliAttachment) => void;
  onDeleteAttachment: (attachment: KesaseteliAttachment) => void;
};

/**
 * Renders a data table listing all uploaded attachments for an application.
 *
 * The table displays varying columns depending on the viewport (mobile vs desktop)
 * and whether the attachment type classification is enabled (e.g., for employer applications).
 * It provides action buttons to view comments or delete attachments.
 */
const AttachmentTable: React.FC<AttachmentTableProps> = ({
  attachments,
  hasAttachmentTypes,
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
            {hasAttachmentTypes && (
              <th>{t('common:handlerApplication.attachmentType')}</th>
            )}
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
                {hasAttachmentTypes && (
                  <td>
                    {attachment.attachment_type
                      ? t(
                          `common:handlerApplication.${attachment.attachment_type}`
                        )
                      : ''}
                  </td>
                )}
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
                    <td>
                      {attachment.author_name ||
                        t('common:handlerApplication.attachmentUploaded')}
                    </td>
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

export type ApplicationAttachmentsProps = {
  attachments: HandlerAttachment[];
  applicationId: string;
  isMultiVoucher?: boolean;
  attachmentTypes?: readonly AttachmentType[];
  isUploading: boolean;
  isDeleting: boolean;
  onUpload: (file: File, attachmentType?: AttachmentType) => void;
  onDeleteConfirm: (
    attachment: HandlerAttachment,
    onSettled: () => void
  ) => void;
  onOpenAttachment: (attachment: HandlerAttachment) => void;
};

/**
 * Generic container component for application attachments.
 *
 * It orchestrates the state and interactions for uploading, displaying, and deleting
 * attachments, as well as managing dialogs for deletion confirmation and attachment notes.
 * This component is intended to be wrapped by type-specific components (e.g.,
 * `EmployerApplicationAttachments` or `YouthApplicationAttachments`) which inject the
 * necessary backend mutation hooks and logic.
 */
const ApplicationAttachments: React.FC<ApplicationAttachmentsProps> = ({
  attachments,
  applicationId,
  isMultiVoucher = false,
  attachmentTypes,
  isUploading,
  isDeleting,
  onUpload,
  onDeleteConfirm,
  onOpenAttachment,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.m})`);

  const { canUploadAttachments, canDeleteAttachments } =
    useHandlerPermissions();

  const uploadRef = useRef<HTMLInputElement>(null);
  const [attachmentType, setAttachmentType] = useState<
    AttachmentType | undefined
  >(attachmentTypes?.[0]);
  const [isDragging, setIsDragging] = useState(false);

  const [deleteTargetAttachment, setDeleteTargetAttachment] =
    useState<HandlerAttachment | null>(null);
  const [commentsTargetAttachment, setCommentsTargetAttachment] =
    useState<HandlerAttachment | null>(null);

  const validateAndUpload = (file: File): void => {
    if (!validateAttachmentFile(file, t)) return;
    onUpload(file, attachmentType);
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

  const handleDeleteConfirm = (): void => {
    if (!deleteTargetAttachment) return;
    onDeleteConfirm(deleteTargetAttachment, () => {
      setDeleteTargetAttachment(null);
    });
  };

  const hasAttachmentTypes = Boolean(
    attachmentTypes && attachmentTypes.length > 0
  );

  return (
    <$AttachmentsContainer>
      <AttachmentInputArea
        attachmentTypes={attachmentTypes}
        attachmentType={attachmentType}
        setAttachmentType={setAttachmentType as (type: AttachmentType) => void}
        isMultiVoucher={isMultiVoucher}
        isMobile={isMobile}
        isDragging={isDragging}
        isUploading={isUploading}
        disabled={!canUploadAttachments}
        uploadRef={uploadRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onFileInputChange={handleFileInputChange}
      />

      <AttachmentTable
        attachments={attachments}
        hasAttachmentTypes={hasAttachmentTypes}
        isMobile={isMobile}
        canDeleteAttachments={canDeleteAttachments}
        isDeleting={isDeleting}
        deletingAttachmentId={deleteTargetAttachment?.id}
        onOpenAttachment={onOpenAttachment}
        onOpenComments={(att) =>
          setCommentsTargetAttachment(att as HandlerAttachment)
        }
        onDeleteAttachment={(att) =>
          setDeleteTargetAttachment(att as HandlerAttachment)
        }
      />

      {deleteTargetAttachment && (
        <DeleteAttachmentDialog
          attachment={deleteTargetAttachment}
          isOpen={Boolean(deleteTargetAttachment)}
          isDeleting={isDeleting}
          onClose={() => setDeleteTargetAttachment(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}

      {commentsTargetAttachment && (
        <AttachmentCommentsDialog
          attachment={commentsTargetAttachment}
          applicationId={applicationId}
          isOpen={Boolean(commentsTargetAttachment)}
          onClose={() => setCommentsTargetAttachment(null)}
        />
      )}
    </$AttachmentsContainer>
  );
};

export default ApplicationAttachments;
