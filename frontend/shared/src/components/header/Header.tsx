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
  titleUrl?: string;
  skipToContentLabel?: string;
  menuToggleAriaLabel?: string;
  languages?: OptionType<string>[];
  isNavigationVisible?: boolean;
  navigationItems?: NavigationItem[];
  customItems?: React.ReactNode[];
  navigationVariant?: NavigationVariant;
  onLanguageChange?: (
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
  hideLogin?: boolean;
  onTitleClick?: () => void;
};

const Header: React.FC<HeaderProps> = ({
  skipToContentLabel,
  title,
  titleUrl,
  menuToggleAriaLabel,
  languages,
  isNavigationVisible = true,
  navigationItems,
  navigationVariant,
  customItems,
  onLanguageChange,
  login,
  hideLogin,
  theme,
  onTitleClick,
}) => {
  const {
    locale,
    logoLang,
    menuOpen,
    toggleMenu,
    closeMenu,
    handleLogin,
    handleLogout,
    t,
  } = useHeader(login);

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
    <div data-testid="header">
      <Navigation
        theme={theme}
        menuOpen={menuOpen}
        onMenuToggle={toggleMenu}
        menuToggleAriaLabel={menuToggleAriaLabel || ''}
        skipTo={`#${MAIN_CONTENT_ID}`}
        skipToContentLabel={skipToContentLabel}
        logoLanguage={logoLang as LogoLanguage}
        title={title}
        titleUrl={titleUrl}
        titleAriaLabel={title}
        onTitleClick={onTitleClick}
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
          {customItems?.map((item, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <Navigation.Item key={`custom-nav-item-${index}`}>
              {item}
            </Navigation.Item>
          ))}
          {login && !hideLogin && (
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
          {languages && onLanguageChange && (
            <Navigation.LanguageSelector
              buttonAriaLabel={t('common:header.languageMenuButtonAriaLabel')}
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
    </div>
  );
};

Header.defaultProps = {
  title: undefined,
  titleUrl: undefined,
  skipToContentLabel: undefined,
  menuToggleAriaLabel: undefined,
  languages: undefined,
  isNavigationVisible: undefined,
  navigationItems: undefined,
  customItems: null,
  navigationVariant: undefined,
  onLanguageChange: undefined,
  login: undefined,
  hideLogin: false,
  theme: undefined,
  onTitleClick: undefined,
};

export default Header;
