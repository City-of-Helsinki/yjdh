import { ROUTES } from 'benefit/applicant/constants';
import useLogin from 'benefit/applicant/hooks/useLogin';
import useLogoutQuery from 'benefit/applicant/hooks/useLogoutQuery';
import useUserQuery from 'benefit/applicant/hooks/useUserQuery';
import { Button, IconLock, IconSpeechbubbleText } from 'hds-react';
import noop from 'lodash/noop';
import { useRouter } from 'next/router';
import * as React from 'react';
import BaseHeader from 'shared/components/header/Header';
import useToggle from 'shared/hooks/useToggle';

import Messenger from '../messenger/Messenger';
import { $CustomMessagesActions } from './Header.sc';
import { useHeader } from './useHeader';

const Header: React.FC = () => {
  const { t, locale, languageOptions, hasMessenger, handleLanguageChange } =
    useHeader();
  const router = useRouter();
  const { asPath } = router;

  const login = useLogin();
  const userQuery = useUserQuery();
  const logoutQuery = useLogoutQuery();

  const isLoading = userQuery.isLoading || logoutQuery.isLoading;
  const isLoginPage = asPath?.startsWith(ROUTES.LOGIN);
  const isApplicationPage = asPath?.startsWith(ROUTES.APPLICATION_FORM);

  const [isMessagesDrawerVisible, toggleMessagesDrawerVisiblity] =
    useToggle(false);

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
          isAuthenticated && hasMessenger
            ? [
                <Button
                  variant="supplementary"
                  size="small"
                  iconLeft={<IconSpeechbubbleText />}
                  theme="coat"
                  onClick={toggleMessagesDrawerVisiblity}
                >
                  {t('common:header.messages')}
                </Button>,
              ]
            : undefined
        }
      />
      {isAuthenticated && hasMessenger && (
        <Messenger
          isOpen={isMessagesDrawerVisible}
          onClose={toggleMessagesDrawerVisiblity}
          customItemsMessages={
            <$CustomMessagesActions>
              <IconLock />
              <p>{t('common:messenger.isSecure')}</p>
            </$CustomMessagesActions>
          }
        />
      )}
    </>
  );
};

export default Header;
