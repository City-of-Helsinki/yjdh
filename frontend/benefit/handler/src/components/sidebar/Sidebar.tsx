import { Application } from 'benefit/handler/types/application';
import { Tab, TabPanel, Tabs } from 'hds-react';
import * as React from 'react';
import { $TabList } from 'shared/components/benefit/tabs/Tabs.sc';
import Drawer from 'shared/components/drawer/Drawer';
import Actions from 'shared/components/messaging/Actions';

import ChangeList from './ChangeList';
import Messages from './Messages';
import { useSidebar } from './useSidebar';

interface ComponentProps {
  isOpen: boolean;
  messagesReadOnly?: boolean;
  notesReadOnly?: boolean;
  onClose?: () => void;
  customItemsMessages?: React.ReactNode;
  customItemsNotes?: React.ReactNode;
  application: Application;
}

const Sidebar: React.FC<ComponentProps> = ({
  isOpen,
  messagesReadOnly,
  notesReadOnly,
  customItemsMessages,
  customItemsNotes,
  onClose,
  application,
}) => {
  const { t, messages, notes, handleSendMessage, handleCreateNote } =
    useSidebar(application?.id);

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      closeText={t('common:messenger.close')}
      stickyBarInUse
    >
      <Tabs>
        <$TabList>
          <Tab>{t('common:header.messages')}</Tab>
          <Tab>{t('common:header.notes')}</Tab>
          <Tab>{t('common:header.changes')}</Tab>
        </$TabList>
        <TabPanel
          css={`
            display: flex;
            flex-direction: column;
            flex-grow: 1;
          `}
        >
          <Messages data={messages} variant="message" withScroll />
          {!messagesReadOnly && (
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
          {!notesReadOnly && (
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
        <TabPanel
          css={`
            display: flex;
            flex-direction: column;
            flex-grow: 1;
          `}
        >
          <ChangeList data={application.changes} />
        </TabPanel>
      </Tabs>
    </Drawer>
  );
};

export default Sidebar;
