import { APPLICATION_STATUSES } from 'benefit/handler/constants';
import AppContext from 'benefit/handler/context/AppContext';
import { useApplicationActions } from 'benefit/handler/hooks/useApplicationActions';
import useHandlerReviewActions from 'benefit/handler/hooks/useHandlerReviewActions';
import {
  Application,
  HandledAplication,
} from 'benefit/handler/types/application';
import { TFunction, useTranslation } from 'next-i18next';
import React, { useEffect, useState } from 'react';
import useToggle from 'shared/hooks/useToggle';

type ExtendedComponentProps = {
  t: TFunction;
  onDone: () => void;
  onSaveAndClose: () => void;
  onBackToHandling: () => void;
  onCommentsChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  toggleMessagesDrawerVisiblity: () => void;
  handleCancel: (application: HandledAplication) => void;
  openDialog: () => void;
  closeDialog: () => void;
  translationsBase: string;
  isDisabledDoneButton: boolean;
  isMessagesDrawerVisible: boolean;
  isConfirmationModalOpen: boolean;
  cancelComments: string;
};

const useHandlingApplicationActions = (
  application: Application
): ExtendedComponentProps => {
  const translationsBase = 'common:review.actions';
  const { t } = useTranslation();
  const { onSaveAndClose, onDone, onCancel } =
    useHandlerReviewActions(application);
  const { updateStatus } = useApplicationActions(application);
  const { handledApplication, setHandledApplication } =
    React.useContext(AppContext);
  const [isMessagesDrawerVisible, toggleMessagesDrawerVisiblity] =
    useToggle(false);

  const [isConfirmationModalOpen, setIsConfirmationModalOpen] =
    useState<boolean>(false);

  const [cancelComments, setCancelComments] = useState<string>('');

  const isDisabledDoneButton = React.useMemo(
    (): boolean =>
      !handledApplication ||
      !(
        handledApplication.status === APPLICATION_STATUSES.ACCEPTED ||
        (handledApplication.status === APPLICATION_STATUSES.REJECTED &&
          handledApplication.logEntryComment)
      ),
    [handledApplication]
  );

  const openDialog = (): void => setIsConfirmationModalOpen(true);

  const closeDialog = (): void => {
    setIsConfirmationModalOpen(false);
    setHandledApplication(null);
  };

  useEffect(() => {
    if (application.status === APPLICATION_STATUSES.CANCELLED) {
      setIsConfirmationModalOpen(false);
    }
  }, [application]);

  const handleCancel = (cancelledApplication: HandledAplication): void => {
    // workaround for broken hds dialog
    setHandledApplication(cancelledApplication);
    onCancel(cancelledApplication);
  };

  const onCommentsChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ): void => setCancelComments(event.target.value);

  const onBackToHandling = (): void =>
    updateStatus(APPLICATION_STATUSES.HANDLING);

  return {
    t,
    onDone,
    onSaveAndClose,
    onCommentsChange,
    onBackToHandling,
    toggleMessagesDrawerVisiblity,
    handleCancel,
    openDialog,
    closeDialog,
    isMessagesDrawerVisible,
    translationsBase,
    isDisabledDoneButton,
    isConfirmationModalOpen,
    cancelComments,
  };
};

export { useHandlingApplicationActions };
