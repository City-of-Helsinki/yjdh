import { MESSAGE_TYPES } from 'benefit-shared/constants';
import { $TabList } from 'benefit-shared/tabs/Tabs.sc';
import AppContext from 'benefit/handler/context/AppContext';
import { Tab, TabPanel, Tabs } from 'hds-react';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import Drawer from 'shared/components/drawer/Drawer';
import Actions from 'shared/components/messaging/Actions';
import Message from 'shared/components/messaging/Message';
import { $MessagesList } from 'shared/components/messaging/Messaging.sc';
import camelCase from 'lodash/camelCase';

const Messenger: React.FC = () => {
  const { t } = useTranslation();
  const { isMessagesDrawerVisible, messages } = React.useContext(AppContext);

  return (
    <Drawer isOpen={isMessagesDrawerVisible}>
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
          <$MessagesList>
            {messages
              .filter((m) => m.messageType !== MESSAGE_TYPES.NOTE)
              .map((message) => (
                <Message
                  key={message.id}
                  sender={t(
                    `common:messenger.titles.${camelCase(message.messageType)}`
                  )}
                  date={message.modifiedAt}
                  text={message.content}
                  isPrimary={
                    message.messageType === MESSAGE_TYPES.HANDLER_MESSAGE
                  }
                />
              ))}
          </$MessagesList>
          <Actions />
        </TabPanel>
        <TabPanel
          css={`
            display: flex;
            flex-direction: column;
            flex-grow: 1;
          `}
        >
          <Actions />
          <$MessagesList>
            {messages
              .filter((m) => m.messageType === MESSAGE_TYPES.NOTE)
              .map((message) => (
                <Message
                  key={message.id}
                  sender={'SenderName'}
                  date={message.modifiedAt}
                  text={message.content}
                  isPrimary={message.messageType === MESSAGE_TYPES.NOTE}
                />
              ))}
          </$MessagesList>
        </TabPanel>
      </Tabs>
    </Drawer>
  );
};

export default Messenger;
