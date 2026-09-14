import React from 'react';
import { ATTACHMENT_TYPES } from 'shared/constants/attachment-constants';
import type { AttachmentType } from 'shared/types/attachment';

import useAttachmentActionToasts from '../../hooks/attachments/useAttachmentActionToasts';
import useDeleteEmployerAttachmentMutation from '../../hooks/backend/useDeleteEmployerAttachmentMutation';
import useOpenEmployerAttachment from '../../hooks/backend/useOpenEmployerAttachment';
import useUploadEmployerAttachmentMutation from '../../hooks/backend/useUploadEmployerAttachmentMutation';
import { isHandledEmployerApplicationStatus } from '../../types/application';
import type HandlerEmployerApplication from '../../types/HandlerEmployerApplication';
import type { HandlerAttachment } from '../../types/HandlerEmployerApplication';
import { buildAttachmentFormData } from '../../utils/attachment.utils';
import ApplicationAttachments from './ApplicationAttachments';

const findVoucherIdForAttachment = (
  application: HandlerEmployerApplication,
  attachmentId: string
): string =>
  application.summer_vouchers.find((v) =>
    v.attachments?.some((a) => a.id === attachmentId)
  )?.id ?? '';

type Props = {
  application: HandlerEmployerApplication;
};

const EmployerApplicationAttachments: React.FC<Props> = ({ application }) => {
  const openAttachment = useOpenEmployerAttachment();
  const uploadMutation = useUploadEmployerAttachmentMutation();
  const deleteMutation = useDeleteEmployerAttachmentMutation();
  const { getUploadCallbacks, getDeleteCallbacks } =
    useAttachmentActionToasts();

  const canDeleteAttachments = !isHandledEmployerApplicationStatus(
    application.status
  );

  const attachments = application.summer_vouchers.flatMap(
    (voucher) => voucher.attachments || []
  );

  const isMultiVoucher = application.summer_vouchers.length > 1;
  const uploadVoucherId = application.summer_vouchers[0]?.id;

  const handleUpload = (file: File, attachmentType?: AttachmentType): void => {
    if (!uploadVoucherId || !attachmentType) return;
    uploadMutation.mutate(
      {
        summer_voucher: uploadVoucherId,
        applicationId: application.id,
        data: buildAttachmentFormData(file, attachmentType),
      },
      getUploadCallbacks()
    );
  };

  const handleDeleteConfirm = (
    attachment: HandlerAttachment,
    onSettled: () => void
  ): void => {
    const voucherId = findVoucherIdForAttachment(application, attachment.id);
    deleteMutation.mutate(
      {
        voucherId,
        applicationId: application.id,
        attachmentId: attachment.id,
      },
      getDeleteCallbacks(onSettled)
    );
  };

  return (
    <ApplicationAttachments
      attachments={attachments}
      applicationId={application.id}
      canDeleteAttachments={canDeleteAttachments}
      isMultiVoucher={isMultiVoucher}
      attachmentTypes={ATTACHMENT_TYPES}
      isUploading={uploadMutation.isPending}
      isDeleting={deleteMutation.isPending}
      onUpload={handleUpload}
      onDeleteConfirm={handleDeleteConfirm}
      onOpenAttachment={
        openAttachment as (attachment: HandlerAttachment) => void
      }
    />
  );
};

export default EmployerApplicationAttachments;
