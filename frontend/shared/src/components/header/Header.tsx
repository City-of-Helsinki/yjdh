import { IconGlobe, IconSignout, LogoLanguage, Navigation } from 'hds-react';
import React from 'react';
import { MAIN_CONTENT_ID } from 'shared/constants';
import { NavigationItem, OptionType } from 'shared/types/common';
import { isTabActive } from 'shared/utils/menu.utils';

import { useHeader } from './useHeader';

export type HeaderProps = {
  title?: string;
  menuToggleAriaLabel?: string;
  locale: string;
  languages: OptionType<string>[];
  navigationItems?: NavigationItem[];
  onLanguageChange: (
    e: React.SyntheticEvent<unknown>,
    language: OptionType<string>
  ) => void;
  onTitleClick: (callback: () => void) => void;
  onNavigationItemClick: (pathname: string) => void;
  login?: {
    isAuthenticated: boolean;
    loginLabel: string;
    logoutLabel: string;
    userAriaLabelPrefix: string;
    onLogin: () => void;
    onLogout: () => void;
    userName?: string;
  };
};

const Header: React.FC<HeaderProps> = ({
  title,
  menuToggleAriaLabel,
  languages,
  locale,
  navigationItems,
  onTitleClick,
  onNavigationItemClick,
  onLanguageChange,
  login,
}) => {
  const {
    logoLang,
    menuOpen,
    toggleMenu,
    closeMenu,
    handleNavigationItemClick,
    handleLogin,
    handleLogout,
  } = useHeader(locale, onNavigationItemClick, login);

  return (
    <Navigation
      menuOpen={menuOpen}
      onMenuToggle={toggleMenu}
      menuToggleAriaLabel={menuToggleAriaLabel || ''}
      skipTo={`#${MAIN_CONTENT_ID}`}
      skipToContentLabel={MAIN_CONTENT_ID}
      onTitleClick={() => onTitleClick(closeMenu)}
      logoLanguage={logoLang as LogoLanguage}
      title={title}
    >
      {navigationItems && (
        <Navigation.Row variant="inline">
          {navigationItems?.map((item) => (
            <Navigation.Item
              key={item.url}
              active={isTabActive(item.url)}
              href={item.url}
              label={item.label}
              onClick={handleNavigationItemClick(item.url)}
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
