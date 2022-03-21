import { ROUTES } from 'benefit/applicant/constants';
import useLogin from 'benefit/applicant/hooks/useLogin';
import useLogout from 'benefit/applicant/hooks/useLogout';
import useUserQuery from 'benefit/applicant/hooks/useUserQuery';
import { Button, IconLock, IconSpeechbubbleText } from 'hds-react';
import noop from 'lodash/noop';
import { useRouter } from 'next/router';
import * as React from 'react';
import BaseHeader from 'shared/components/header/Header';

import Messenger from '../messenger/Messenger';
import { $CustomMessagesActions } from './Header.sc';
import { useHeader } from './useHeader';

const Header: React.FC = () => {
  const {
    t,
    languageOptions,
    hasMessenger,
    unreadMessagesCount,
    isMessagesDrawerVisible,
    handleLanguageChange,
    toggleMessagesDrawerVisiblity,
  } = useHeader();
  const router = useRouter();
  const { asPath } = router;

  const login = useLogin();
  const userQuery = useUserQuery();
  const logout = useLogout();

  const { isLoading, isSuccess, data } = userQuery;
  const isLoginPage = asPath?.startsWith(ROUTES.LOGIN);

  const isAuthenticated = !isLoginPage && isSuccess;

  return (
    <>
      <BaseHeader
        title={t('common:appName')}
        menuToggleAriaLabel={t('common:menuToggleAriaLabel')}
        languages={languageOptions}
        onLanguageChange={handleLanguageChange}
        login={{
          isAuthenticated: !isLoginPage && isSuccess,
          loginLabel: t('common:header.loginLabel'),
          logoutLabel: t('common:header.logoutLabel'),
          onLogin: !isLoading ? login : noop,
          onLogout: !isLoading ? logout : noop,
          userName: isSuccess ? data?.name : undefined,
          userAriaLabelPrefix: t('common:header.userAriaLabelPrefix'),
        }}
        customItems={
          isAuthenticated && hasMessenger
            ? [
                <Button
                  variant={unreadMessagesCount ? 'primary' : 'secondary'}
                  css={`
                    border: none;
                  `}
                  size="small"
                  iconLeft={<IconSpeechbubbleText />}
                  theme="coat"
                  onClick={toggleMessagesDrawerVisiblity}
                >
                  {t('common:header.messages')}
                  {unreadMessagesCount
                    ? ` (${t('common:applications.list.common.newMessages', {
                        count: unreadMessagesCount,
                      })})`
                    : ''}
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
