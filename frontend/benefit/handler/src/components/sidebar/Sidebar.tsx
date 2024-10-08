import { Application } from 'benefit/handler/types/application';
import { MESSAGE_TYPES } from 'benefit-shared/constants';
import { Button, Tab, TabPanel, Tabs } from 'hds-react';
import * as React from 'react';
import { useEffect } from 'react';
import { $TabList } from 'shared/components/benefit/tabs/Tabs.sc';
import Drawer from 'shared/components/drawer/Drawer';
import Actions from 'shared/components/messaging/Actions';

import ChangeList from './ChangeList';
import Messages from './Messages';
import { useSidebar } from './useSidebar';

interface ComponentProps {
  isOpen: boolean;
  messagesReadOnly?: boolean;
  onClose?: () => void;
  customItemsMessages?: Array<React.ReactNode>;
  customItemsNotes?: Array<React.ReactNode>;
  application: Application;
}

const Sidebar: React.FC<ComponentProps> = ({
  isOpen,
  messagesReadOnly,
  customItemsMessages,
  customItemsNotes,
  onClose,
  application,
}) => {
  const {
    t,
    messages,
    notes,
    handleSendMessage,
    handleCreateNote,
    handleMarkMessagesRead,
    handleMarkLastMessageUnread,
  } = useSidebar(application?.id);

  useEffect(() => {
    if (isOpen) {
      handleMarkMessagesRead();
    }
  }, [handleMarkMessagesRead, isOpen, messages.length]);

  const closeAndMarkAsUnread = (): void => {
    handleMarkLastMessageUnread(null, {
      onSuccess: onClose,
    });
  };

  const haveApplicantMessages =
    messages?.length > 0 &&
    messages.some(
      (message) => message.messageType === MESSAGE_TYPES.APPLICANT_MESSAGE
    );

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
              customItems={[
                ...(customItemsMessages || []),
                <Button
                  onClick={closeAndMarkAsUnread}
                  variant="secondary"
                  theme="black"
                  size="small"
                  key="markAsUnread"
                  disabled={!haveApplicantMessages}
                >
                  {t('common:messenger.markAsUnread')}
                </Button>,
              ]}
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
          <Actions
            customItems={customItemsNotes}
            sendText={t('common:messenger.save')}
            errorText={t('common:form.validation.string.max', { max: 1024 })}
            placeholder={t('common:messenger.composeNote')}
            onSend={handleCreateNote}
          />
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
