import { IconGlobe, IconSignout, LogoLanguage, Navigation } from 'hds-react';
import React from 'react';
import { MAIN_CONTENT_ID } from 'shared/constants';
import useGoToPage from 'shared/hooks/useGoToPage';
import {
  NavigationItem,
  NavigationVariant,
  OptionType,
  ThemeOption,
} from 'shared/types/common';
import { isTabActive } from 'shared/utils/menu.utils';

import { useHeader } from './useHeader';

export type HeaderProps = {
  title?: string;
  skipToContentLabel?: string;
  menuToggleAriaLabel?: string;
  locale: string;
  languages: OptionType<string>[];
  isNavigationVisible?: boolean;
  navigationItems?: NavigationItem[];
  navigationVariant?: NavigationVariant;
  onLanguageChange: (
    e: React.SyntheticEvent<unknown>,
    language: OptionType<string>
  ) => void;
  login?: {
    isAuthenticated: boolean;
    loginLabel: string;
    logoutLabel: string;
    userAriaLabelPrefix: string;
    onLogin: () => void;
    onLogout: () => void;
    userName?: string;
  };
  theme?: ThemeOption;
};

const Header: React.FC<HeaderProps> = ({
  skipToContentLabel,
  title,
  menuToggleAriaLabel,
  languages,
  locale,
  isNavigationVisible = true,
  navigationItems,
  navigationVariant,
  onLanguageChange,
  login,
  theme,
}) => {
  const {
    logoLang,
    menuOpen,
    toggleMenu,
    closeMenu,
    handleLogin,
    handleLogout,
  } = useHeader(locale, login);

  const goToPage = useGoToPage();

  const handleClickLink = React.useCallback(
    (url = '/') =>
      (event?: Event | MouseEvent) => {
        event?.preventDefault();
        closeMenu();
        goToPage(url as string);
      },
    [closeMenu, goToPage]
  );

  return (
    <Navigation
      theme={theme}
      menuOpen={menuOpen}
      onMenuToggle={toggleMenu}
      menuToggleAriaLabel={menuToggleAriaLabel || ''}
      skipTo={`#${MAIN_CONTENT_ID}`}
      skipToContentLabel={skipToContentLabel}
      logoLanguage={logoLang as LogoLanguage}
      title={title}
      titleAriaLabel={title}
    >
      {isNavigationVisible && navigationItems && (
        <Navigation.Row variant={navigationVariant || 'default'}>
          {navigationItems?.map((item) => (
            <Navigation.Item
              key={item.url}
              active={isTabActive(item.url)}
              href={item.url}
              label={item.label}
              onClick={() => handleClickLink(item.url)}
              icon={item.icon}
            />
          ))}
        </Navigation.Row>
      )}

      <Navigation.Actions>
        {login && (
          <Navigation.User
            authenticated={login.isAuthenticated}
            buttonAriaLabel={
              login.userName
                ? `${login.userAriaLabelPrefix} ${login.userName}`
                : ''
            }
            label={login.loginLabel}
            onSignIn={handleLogin}
            userName={login.userName}
          >
            <Navigation.Item
              href="#"
              onClick={handleLogout}
              variant="supplementary"
              label={login.logoutLabel}
              icon={<IconSignout aria-hidden />}
            />
          </Navigation.User>
        )}
        {languages && (
          <Navigation.LanguageSelector
            buttonAriaLabel={locale?.toUpperCase()}
            label={locale?.toUpperCase()}
            icon={<IconGlobe />}
            closeOnItemClick
          >
            {languages.map((option) => (
              <Navigation.Item
                key={option.value}
                href="#"
                lang={option.value}
                label={option.label}
                onClick={(e: React.SyntheticEvent<unknown>) =>
                  onLanguageChange(e, option)
                }
              />
            ))}
          </Navigation.LanguageSelector>
        )}
      </Navigation.Actions>
    </Navigation>
  );
};

export default Header;
