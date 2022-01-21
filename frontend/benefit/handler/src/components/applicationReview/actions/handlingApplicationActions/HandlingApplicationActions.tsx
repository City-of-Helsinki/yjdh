import Messenger from 'benefit/handler/components/messenger/Messenger';
import { APPLICATION_STATUSES } from 'benefit/handler/constants';
import { useApplicationActions } from 'benefit/handler/hooks/useApplicationActions';
import { Application } from 'benefit/handler/types/application';
import { IconLock } from 'benefit/shared/node_modules/hds-react';
import { Button, IconPen, IconTrash } from 'hds-react';
import noop from 'lodash/noop';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import useToggle from 'shared/hooks/useToggle';

import EditAction from '../editAction/EditAction';
import {
  $Column,
  $CustomNotesActions,
  $Wrapper,
} from './HandlingApplicationActions.sc';

export type Props = {
  application: Application;
};

const HandlingApplicationActions: React.FC<Props> = ({ application }) => {
  const translationsBase = 'common:review.actions';
  const { t } = useTranslation();
  const { updateStatus } = useApplicationActions(application);
  const [isMessagesDrawerVisible, toggleMessagesDrawerVisiblity] =
    useToggle(false);

  return (
    <$Wrapper>
      <$Column>
        <Button
          onClick={() => updateStatus(APPLICATION_STATUSES.HANDLING)}
          theme="coat"
        >
          {t(`${translationsBase}.done`)}
        </Button>
        <Button onClick={noop} theme="black" variant="secondary">
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
