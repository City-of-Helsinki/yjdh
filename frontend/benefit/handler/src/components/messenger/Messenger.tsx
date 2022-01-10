import { $TabList } from 'benefit-shared/tabs/Tabs.sc';
import { Tab, TabPanel, Tabs } from 'hds-react';
import * as React from 'react';
import Drawer from 'shared/components/drawer/Drawer';
import Actions from 'shared/components/messaging/Actions';
import Messages from './Messages';
import { useMessenger } from './useMessenger';

interface ComponentProps {
  isOpen: boolean;
  customItemsMessages?: React.ReactNode;
  customItemsNotes?: React.ReactNode;
}

const Messenger: React.FC<ComponentProps> = ({
  isOpen,
  customItemsMessages,
  customItemsNotes,
}) => {
  const { t, messages, notes, handleSendMessage, handleCreateNote } =
    useMessenger();

  return (
    <Drawer isOpen={isOpen}>
      <Tabs>
        <$TabList>
          <Tab>{t('common:header.messages')}</Tab>
          <Tab>{t('common:header.notes')}</Tab>
        </$TabList>
        <TabPanel
          css={`
            display: flex;
            flex-direction: column;
            flex-grow: 1;
          `}
        >
          <Messages data={messages} />
          <Actions
            customItems={customItemsMessages}
            sendText={t('common:messenger.send')}
            errorText={t('common:form.validation.string.max', { max: 1024 })}
            placeholder={t('common:messenger.compose')}
            onSend={handleSendMessage}
            notification={t('common:messenger.showEveryone')}
          />
        </TabPanel>
        <TabPanel
          css={`
            display: flex;
            flex-direction: column;
            flex-grow: 1;
          `}
        >
          <Actions
            customItems={customItemsNotes}
            sendText={t('common:messenger.save')}
            errorText={t('common:form.validation.string.max', { max: 1024 })}
            placeholder={t('common:messenger.composeNote')}
            onSend={handleCreateNote}
          />
          <Messages data={notes} />
        </TabPanel>
      </Tabs>
    </Drawer>
  );
};

export default Messenger;
