import { APPLICATION_STATUSES } from 'benefit/handler/constants';
import AppContext from 'benefit/handler/context/AppContext';
import useHandlerReviewActions from 'benefit/handler/hooks/useHandlerReviewActions';
import { Application } from 'benefit/handler/types/application';
import { TFunction, useTranslation } from 'next-i18next';
import React, { Dispatch, SetStateAction, useState } from 'react';
import useToggle from 'shared/hooks/useToggle';

type ExtendedComponentProps = {
  t: TFunction;
  onDone: () => void;
  onSaveAndClose: () => void;
  onCommentsChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  toggleMessagesDrawerVisiblity: () => void;
  //handleDelete: () => void;
  setIsConfirmationModalOpen: Dispatch<SetStateAction<boolean>>;
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
  const { onSaveAndClose, onDone } = useHandlerReviewActions(application);
  const { handledApplication } = React.useContext(AppContext);
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

  //const handleDelete = (): void => {};

  const onCommentsChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ): void => setCancelComments(event.target.value);

  return {
    t,
    onDone,
    onSaveAndClose,
    onCommentsChange,
    toggleMessagesDrawerVisiblity,
    //handleDelete,
    setIsConfirmationModalOpen,
    isMessagesDrawerVisible,
    translationsBase,
    isDisabledDoneButton,
    isConfirmationModalOpen,
    cancelComments,
  };
};

export { useHandlingApplicationActions };
