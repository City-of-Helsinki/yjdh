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
  isReadOnly?: boolean;
  onClose?: () => void;
  customItemsMessages?: React.ReactNode;
  customItemsNotes?: React.ReactNode;
}

const Messenger: React.FC<ComponentProps> = ({
  isOpen,
  isReadOnly,
  customItemsMessages,
  customItemsNotes,
  onClose,
}) => {
  const { t, messages, notes, handleSendMessage, handleCreateNote } =
    useMessenger();

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      closeText={t('common:messenger.close')}
    >
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
          <Messages data={messages} variant="message" withScroll />
          {!isReadOnly && (
            <Actions
              customItems={customItemsMessages}
              sendText={t('common:messenger.send')}
              errorText={t('common:form.validation.string.max', { max: 1024 })}
              placeholder={t('common:messenger.compose')}
              onSend={handleSendMessage}
              notification={t('common:messenger.showEveryone')}
            />
          )}
        </TabPanel>
        <TabPanel
          css={`
            display: flex;
            flex-direction: column;
            flex-grow: 1;
          `}
        >
          {!isReadOnly && (
            <Actions
              customItems={customItemsNotes}
              sendText={t('common:messenger.save')}
              errorText={t('common:form.validation.string.max', { max: 1024 })}
              placeholder={t('common:messenger.composeNote')}
              onSend={handleCreateNote}
            />
          )}

          <Messages data={notes?.reverse()} variant="note" />
        </TabPanel>
      </Tabs>
    </Drawer>
  );
};

Messenger.defaultProps = {
  customItemsMessages: [],
  customItemsNotes: [],
  onClose: () => noop,
  isReadOnly: false,
};

export default Messenger;
