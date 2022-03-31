import { Tab, TabPanel, Tabs } from 'hds-react';
import noop from 'lodash/noop';
import * as React from 'react';
import { $TabList } from 'shared/components/benefit/tabs/Tabs.sc';
import Drawer from 'shared/components/drawer/Drawer';
import Actions from 'shared/components/messaging/Actions';

import Messages from './Messages';
import { useMessenger } from './useMessenger';

interface ComponentProps {
  isOpen: boolean;
  onClose?: () => void;
  customItemsMessages?: React.ReactNode;
}

const Messenger: React.FC<ComponentProps> = ({
  isOpen,
  onClose,
  customItemsMessages,
}) => {
  const { t, messages, handleSendMessage } = useMessenger(isOpen);

  return (
    <Drawer
      isOpen={isOpen}
      closeText={t('common:messenger.close')}
      onClose={onClose}
    >
      <Tabs>
        <$TabList position="start">
          <Tab>{t('common:messenger.messages')}</Tab>
        </$TabList>
        <TabPanel
          css={`
            display: flex;
            flex-direction: column;
            flex-grow: 1;
          `}
        >
          <Messages data={messages} variant="message" withScroll />
          <Actions
            customItems={customItemsMessages}
            sendText={t('common:messenger.send')}
            errorText={t('common:form.validation.string.max', { max: 1024 })}
            placeholder={t('common:messenger.compose')}
            onSend={handleSendMessage}
          />
        </TabPanel>
      </Tabs>
    </Drawer>
  );
};

Messenger.defaultProps = {
  customItemsMessages: [],
  onClose: noop,
};

export default Messenger;
