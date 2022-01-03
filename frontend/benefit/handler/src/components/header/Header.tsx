import { Button, IconSpeechbubbleText, Tab, TabPanel, Tabs } from 'hds-react';
import * as React from 'react';
import BaseHeader from 'shared/components/header/Header';
import Message from 'shared/components/messaging/Message';
import { useHeader } from './useHeader';
import Drawer from 'shared/components/drawer/Drawer';
import Actions from 'shared/components/messaging/Actions';
import { $TabList, $TabPanel } from 'benefit-shared/tabs/Tabs.sc';

const Header: React.FC = () => {
  const {
    t,
    locale,
    languageOptions,
    navigationItems,
    isNavigationVisible,
    handleLanguageChange,
  } = useHeader();

  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);

  const messages = [
    {
      sender: 'Käsittelijä',
      date: '13.05.2021 • 08:47',
      text: 'Huomasimme, että tilinumeronne on eri kuin viimeksi. Tarkistatteko sen, kiitos.',
    },
    {
      sender: 'Käsittelijä',
      date: '13.05.2021 • 08:47',
      text: 'Huomasimme, että tilinumeronne on eri kuin viimeksi. Tarkistatteko sen, kiitos.',
    },
    {
      sender: 'Käsittelijä',
      date: '13.05.2021 • 08:47',
      text: 'Huomasimme, että tilinumeronne on eri kuin viimeksi. Tarkistatteko sen, kiitos.',
    },
    {
      sender: 'Käsittelijä',
      date: '13.05.2021 • 08:47',
      text: 'Huomasimme, että tilinumeronne on eri kuin viimeksi. Tarkistatteko sen, kiitos.',
    },
  ];

  const messagesElements = messages.map((message) => (
    <Message
      key={message.sender}
      sender={message.sender}
      date={message.date}
      text={message.text}
    />
  ));

  return (
    <>
      <BaseHeader
        title={t('common:appName')}
        menuToggleAriaLabel={t('common:menuToggleAriaLabel')}
        languages={languageOptions}
        locale={locale}
        isNavigationVisible={isNavigationVisible}
        navigationItems={navigationItems}
        onLanguageChange={handleLanguageChange}
        theme="dark"
        customItems={[
          <Button
            variant="supplementary"
            size="small"
            iconLeft={<IconSpeechbubbleText />}
            theme="coat"
            onClick={() => setIsDrawerOpen((prev) => !prev)}
          >
            {t('common:header.messages')}
          </Button>,
        ]}
      />
      <Drawer isOpen={isDrawerOpen} title="">
        <Tabs>
          <$TabList>
            <Tab>Viestit</Tab>
            <Tab>Muistiinpanot</Tab>
          </$TabList>
          <TabPanel
            css={`
              display: flex;
              flex-direction: column;
              //height: 100%;
              flex-grow: 1;
            `}
          >
            <div style={{ flexGrow: 1, overflowY: 'auto', height: 0 }}>
              {messagesElements}
            </div>
            <div>
              <Actions />
            </div>
          </TabPanel>
        </Tabs>
      </Drawer>
    </>
  );
};

export default Header;
