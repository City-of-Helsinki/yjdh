import Messenger from 'benefit/handler/components/messenger/Messenger';
import { APPLICATION_STATUSES } from 'benefit/handler/constants';
import { useApplicationActions } from 'benefit/handler/hooks/useApplicationActions';
import { Application } from 'benefit/handler/types/application';
import { Button, IconPen, IconTrash } from 'hds-react';
import noop from 'lodash/noop';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import EditAction from '../editAction/EditAction';
import { $Column, $Wrapper } from './HandlingApplicationActions.sc';

export type Props = {
  application: Application;
};

const HandlingApplicationActions: React.FC<Props> = ({ application }) => {
  const translationsBase = 'common:review.actions';
  const { t } = useTranslation();
  const { updateStatus } = useApplicationActions(application);
  const [isMessagesDrawerVisible, setIsMessagesDrawerVisible] =
    React.useState<boolean>(false);

  const handlePanel = (): void =>
    setIsMessagesDrawerVisible(!isMessagesDrawerVisible);

  return (
    <>
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
            onClick={handlePanel}
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
          customItems={<EditAction application={application} />}
        />
      </$Wrapper>
    </>
  );
};

export default HandlingApplicationActions;
