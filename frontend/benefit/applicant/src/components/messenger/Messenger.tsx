import { Tab, TabPanel, Tabs } from 'hds-react';
import * as React from 'react';
import { $TabList } from 'shared/components/benefit/tabs/Tabs.sc';
import Drawer from 'shared/components/drawer/Drawer';
import Actions from 'shared/components/messaging/Actions';

import Messages from './Messages';
import { useMessenger } from './useMessenger';

interface ComponentProps {
  isOpen: boolean;
  customItemsMessages?: React.ReactNode;
}

const Messenger: React.FC<ComponentProps> = ({
  isOpen,
  customItemsMessages,
}) => {
  const { t, messages, handleSendMessage } = useMessenger();

  return (
    <Drawer isOpen={isOpen}>
      <Tabs>
        <$TabList>
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
};

export default Messenger;
