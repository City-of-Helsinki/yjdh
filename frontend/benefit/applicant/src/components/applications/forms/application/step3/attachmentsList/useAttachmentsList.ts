import { ATTACHMENT_TYPES } from 'benefit/applicant/constants';
import ApplicationContext from 'benefit/applicant/context/ApplicationContext';
import useRemoveAttachmentQuery from 'benefit/applicant/hooks/useRemoveAttachmentQuery';
import { useTranslation } from 'benefit/applicant/i18n';
import { Attachment } from 'benefit/applicant/types/application';
import { showErrorToast } from 'benefit/applicant/utils/common';
import { useRouter } from 'next/router';
import { TFunction } from 'next-i18next';
import React, { useEffect } from 'react';

type ExtendedComponentProps = {
  t: TFunction;
  translationsBase: string;
  applicationId: string;
  attachments: [];
  handleRemove: (attachmentId: string) => void;
  files?: Attachment[];
  isRemoving: boolean;
};

const useAttachmentsList = (
  attachmentType: ATTACHMENT_TYPES,
  attachments?: Attachment[]
): ExtendedComponentProps => {
  const router = useRouter();
  const id = router?.query?.id;
  const { t } = useTranslation();
  const translationsBase = 'common:applications.sections.attachments';
  const { applicationTempData } = React.useContext(ApplicationContext);

  const applicationId = applicationTempData.id || id?.toString() || '';

  const {
    mutate: removeAttachment,
    isLoading: isRemoving,
    isError: isRemovingError,
  } = useRemoveAttachmentQuery();

  useEffect(() => {
    if (isRemovingError) {
      showErrorToast(
        t(`common:remove.errorTitle`),
        t(`common:remove.errorMessage`)
      );
    }
  }, [isRemovingError, t]);

  const files = React.useMemo(
    (): Attachment[] =>
      attachments?.filter((att) => att.attachmentType === attachmentType) || [],
    [attachmentType, attachments]
  );

  const handleRemove = (attachmentId: string): void => {
    removeAttachment({
      applicationId,
      attachmentId,
    });
  };

  return {
    t,
    applicationId,
    attachments: [],
    translationsBase,
    files,
    isRemoving,
    handleRemove,
  };
};

export { useAttachmentsList };
