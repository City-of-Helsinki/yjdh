import type ActivatedYouthApplication from 'kesaseteli-shared/types/activated-youth-application';
import React from 'react';

import useAttachmentActionToasts from '../../hooks/attachments/useAttachmentActionToasts';
import useDeleteYouthAttachmentMutation from '../../hooks/backend/useDeleteYouthAttachmentMutation';
import useOpenYouthAttachment from '../../hooks/backend/useOpenYouthAttachment';
import useUploadYouthAttachmentQuery from '../../hooks/backend/useUploadYouthAttachmentQuery';
import { isHandledYouthApplicationStatus } from '../../types/application';
import type { HandlerAttachment } from '../../types/HandlerEmployerApplication';
import { buildAttachmentFormData } from '../../utils/attachment.utils';
import ApplicationAttachments from './ApplicationAttachments';

type Props = {
  application: ActivatedYouthApplication;
};

const YouthApplicationAttachments: React.FC<Props> = ({ application }) => {
  const openAttachment = useOpenYouthAttachment(application.id);
  const uploadMutation = useUploadYouthAttachmentQuery();
  const deleteMutation = useDeleteYouthAttachmentMutation();
  const { getUploadCallbacks, getDeleteCallbacks } =
    useAttachmentActionToasts();

  const canDeleteAttachments = !isHandledYouthApplicationStatus(
    application.status
  );

  const attachments = (application.attachments ?? []) as HandlerAttachment[];

  const handleUpload = (file: File): void => {
    uploadMutation.mutate(
      {
        applicationId: application.id,
        data: buildAttachmentFormData(file),
      },
      getUploadCallbacks()
    );
  };

  const handleDeleteConfirm = (
    attachment: HandlerAttachment,
    onSettled: () => void
  ): void => {
    deleteMutation.mutate(
      {
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
      isMultiVoucher={false}
      attachmentTypes={[]} // No radio buttons for type selector
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

export default YouthApplicationAttachments;
