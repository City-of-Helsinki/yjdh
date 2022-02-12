import { APPLICATION_STATUSES } from 'benefit/handler/constants';
import AppContext from 'benefit/handler/context/AppContext';
import useHandlerReviewActions from 'benefit/handler/hooks/useHandlerReviewActions';
import { Application } from 'benefit/handler/types/application';
import { TFunction, useTranslation } from 'next-i18next';
import React from 'react';
import useToggle from 'shared/hooks/useToggle';

type ExtendedComponentProps = {
  t: TFunction;
  onDone: () => void;
  onSaveAndClose: () => void;
  toggleMessagesDrawerVisiblity: () => void;
  translationsBase: string;
  isDisabledDoneButton: boolean;
  isMessagesDrawerVisible: boolean;
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

  return {
    t,
    onDone,
    onSaveAndClose,
    toggleMessagesDrawerVisiblity,
    isMessagesDrawerVisible,
    translationsBase,
    isDisabledDoneButton,
  };
};

export { useHandlingApplicationActions };
