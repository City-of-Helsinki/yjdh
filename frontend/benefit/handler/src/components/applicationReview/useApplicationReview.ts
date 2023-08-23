import AppContext from 'benefit/handler/context/AppContext';
import useApplicationQuery from 'benefit/handler/hooks/useApplicationQuery';
import useReviewStateQuery from 'benefit/handler/hooks/useReviewStateQuery';
import useUpdateReviewStateQuery from 'benefit/handler/hooks/useUpdateReviewStateQuery';
import useUploadAttachmentQuery from 'benefit/handler/hooks/useUploadAttachmentQuery';
import {
  Application,
  HandledAplication,
  ReviewState,
  ReviewStateData,
} from 'benefit/handler/types/application';
import camelcaseKeys from 'camelcase-keys';
import { useRouter } from 'next/router';
import { TFunction, useTranslation } from 'next-i18next';
import React, { useEffect, useState } from 'react';
import showErrorToast from 'shared/components/toast/show-error-toast';
import hdsToast from 'shared/components/toast/Toast';
import snakecaseKeys from 'snakecase-keys';

type ExtendedComponentProps = {
  t: TFunction;
  application: Application;
  handledApplication: HandledAplication | null;
  id: string | string[] | undefined;
  isError: boolean;
  isLoading: boolean;
  isUploading: boolean;
  handleUpload: (attachment: FormData) => void;
  reviewState: ReviewState;
  handleUpdateReviewState: (reviewState: ReviewState) => void;
};

const useApplicationReview = (): ExtendedComponentProps => {
  const { t } = useTranslation();
  const router = useRouter();
  const { handledApplication } = React.useContext(AppContext);
  const id = router?.query?.id?.toString() ?? '';
  const [isLoading, setIsLoading] = useState(true);

  const {
    status: applicationDataStatus,
    data: applicationData,
    error: applicationDataError,
  } = useApplicationQuery(id);

  const {
    mutate: uploadAttachment,
    isLoading: isUploading,
    isError: isUploadingError,
  } = useUploadAttachmentQuery();

  const {
    status: reviewStateDataStatus,
    data: reviewStateData,
    error: reviewStateDataError,
  } = useReviewStateQuery(id);

  const {
    mutate: updateReviewState,
    isError: isUpdatingReviewStateError,
  } = useUpdateReviewStateQuery();

  const handleUpload = (attachment: FormData): void => {
    uploadAttachment({
      applicationId: id,
      data: attachment,
    });
  };

  const handleUpdateReviewState = (reviewState: ReviewState): void => {
    const data: ReviewStateData = snakecaseKeys(reviewState);
    updateReviewState(data);
  };

  useEffect(() => {
    if (isUploadingError) {
      showErrorToast(
        t(`common:error.attachments.title`),
        t(`common:error.attachments.generic`)
      );
    }
  }, [isUploadingError, t]);

  useEffect(() => {
    if (
      applicationDataError ||
      reviewStateDataError ||
      isUpdatingReviewStateError
    ) {
      hdsToast({
        autoDismissTime: 5000,
        type: 'error',
        labelText: t('common:error.generic.label'),
        text: t('common:error.generic.text'),
      });
    }
  }, [t, applicationDataError, reviewStateDataError, isUpdatingReviewStateError]);

  useEffect(() => {
    const loadingDataStatuses = new Set(['idle', 'loading']);
    if (
      id &&
      !loadingDataStatuses.has(applicationDataStatus) &&
      !loadingDataStatuses.has(reviewStateDataStatus)
    ) {
      setIsLoading(false);
    }
  }, [
    id,
    applicationDataStatus,
    applicationData,
    reviewStateDataStatus,
    reviewStateData,
  ]);

  useEffect(() => {
    if (router.isReady && !router.query.id) {
      setIsLoading(false);
    }
  }, [router]);

  const application: Application = camelcaseKeys(applicationData || {}, {
    deep: true,
  });

  const reviewState: ReviewState = camelcaseKeys(reviewStateData || {}, {
    deep: true,
  });

  return {
    t,
    id,
    application,
    handledApplication,
    isLoading,
    isError: Boolean(id && applicationDataError),
    isUploading,
    handleUpload,
    reviewState,
    handleUpdateReviewState,
  };
};

export { useApplicationReview };
