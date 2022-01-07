import useLogin from 'benefit/applicant/hooks/useLogin';
import useLogoutQuery from 'benefit/applicant/hooks/useLogoutQuery';
import useUserQuery from 'benefit/applicant/hooks/useUserQuery';
import { Button, IconSpeechbubbleText } from 'hds-react';
import noop from 'lodash/noop';
import { useRouter } from 'next/router';
import * as React from 'react';
import Drawer from 'shared/components/drawer/Drawer';
import BaseHeader from 'shared/components/header/Header';
import Actions from 'shared/components/messaging/Actions';
import Message from 'shared/components/messaging/Message';

import { useHeader } from './useHeader';

const Header: React.FC = () => {
  const { t, locale, languageOptions, handleLanguageChange } = useHeader();
  const router = useRouter();
  const { asPath } = router;

  const login = useLogin();
  const userQuery = useUserQuery();
  const logoutQuery = useLogoutQuery();

  const isLoading = userQuery.isLoading || logoutQuery.isLoading;
  const isLoginPage = asPath?.startsWith('/login');

  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);

  const messages = [
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

  const isAuthenticated = !isLoginPage && userQuery.isSuccess;

  return (
    <>
      <BaseHeader
        title={t('common:appName')}
        menuToggleAriaLabel={t('common:menuToggleAriaLabel')}
        languages={languageOptions}
        locale={locale}
        onLanguageChange={handleLanguageChange}
        login={{
          isAuthenticated: !isLoginPage && userQuery.isSuccess,
          loginLabel: t('common:header.loginLabel'),
          logoutLabel: t('common:header.logoutLabel'),
          onLogin: !isLoading ? login : noop,
          onLogout: !isLoading ? () => logoutQuery.mutate({}) : noop,
          userName: userQuery.isSuccess ? userQuery.data.name : undefined,
          userAriaLabelPrefix: t('common:header.userAriaLabelPrefix'),
        }}
        customItems={
          isAuthenticated
            ? [
                <Button
                  variant="supplementary"
                  size="small"
                  iconLeft={<IconSpeechbubbleText />}
                  theme="coat"
                  onClick={() => setIsDrawerOpen((prev) => !prev)}
                >
                  {t('common:header.messages')}
                </Button>,
              ]
            : undefined
        }
      />
      {isAuthenticated && (
        <Drawer
          isOpen={isDrawerOpen}
          title={t('common:header.drawer.title')}
          footer={<Actions />}
          closeBtnAriaLabel={t('common:utility.close')}
          handleClose={() => setIsDrawerOpen(false)}
        >
          {messagesElements}
        </Drawer>
      )}
    </>
  );
};

export default Header;
