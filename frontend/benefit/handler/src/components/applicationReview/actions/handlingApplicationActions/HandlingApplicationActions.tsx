import Messenger from 'benefit/handler/components/messenger/Messenger';
import { Application } from 'benefit/handler/types/application';
import { Button, IconLock, IconPen, IconTrash } from 'hds-react';
import noop from 'lodash/noop';
import * as React from 'react';

import EditAction from '../editAction/EditAction';
import {
  $Column,
  $CustomNotesActions,
  $Wrapper,
} from './HandlingApplicationActions.sc';
import { useHandlingApplicationActions } from './useHandlingApplicationActions';

export type Props = {
  application: Application;
};

const HandlingApplicationActions: React.FC<Props> = ({ application }) => {
  const {
    t,
    onDone,
    onSaveAndClose,
    toggleMessagesDrawerVisiblity,
    isMessagesDrawerVisible,
    translationsBase,
    isDisabledDoneButton,
  } = useHandlingApplicationActions(application);
  return (
    <$Wrapper>
      <$Column>
        <Button onClick={onDone} theme="coat" disabled={isDisabledDoneButton}>
          {t(`${translationsBase}.done`)}
        </Button>
        <Button onClick={onSaveAndClose} theme="black" variant="secondary">
          {t(`${translationsBase}.saveAndContinue`)}
        </Button>
        <Button
          onClick={toggleMessagesDrawerVisiblity}
          theme="black"
          variant="secondary"
          iconLeft={<IconPen />}
        >
          {t(`${translationsBase}.handlingPanel`)}
        </Button>
      </$Column>
      <$Column>
        <Button
          onClick={noop}
          theme="black"
          variant="supplementary"
          iconLeft={<IconTrash />}
        >
          {t(`${translationsBase}.cancel`)}
        </Button>
      </$Column>
      <Messenger
        isOpen={isMessagesDrawerVisible}
        onClose={toggleMessagesDrawerVisiblity}
        customItemsMessages={<EditAction application={application} />}
        customItemsNotes={
          <$CustomNotesActions>
            <IconLock />
            <p>{t('common:messenger.showToHanlderOnly')}</p>
          </$CustomNotesActions>
        }
      />
    </$Wrapper>
  );
};

export default HandlingApplicationActions;
