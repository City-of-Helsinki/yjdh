import { $TabList } from 'benefit-shared/tabs/Tabs.sc';
import { Tab, TabPanel, Tabs } from 'hds-react';
import * as React from 'react';
import Drawer from 'shared/components/drawer/Drawer';
import Actions from 'shared/components/messaging/Actions';
import Messages from './Messages';
import { useMessenger } from './useMessenger';

interface ComponentProps {
  isOpen: boolean;
  customItems?: React.ReactNode;
}

const Messenger: React.FC<ComponentProps> = ({ isOpen, customItems }) => {
  const { t, messages, notes } = useMessenger();

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
          <Actions customItems={customItems} />
        </TabPanel>
        <TabPanel
          css={`
            display: flex;
            flex-direction: column;
            flex-grow: 1;
          `}
        >
          <Actions />
          <Messages data={notes} />
        </TabPanel>
      </Tabs>
    </Drawer>
  );
};

export default Messenger;
