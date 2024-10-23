import {
  Header,
  IconGlobe,
  IconSignin,
  IconSignout,
  IconUser,
  Logo,
  logoFi,
  logoFiDark,
  logoSv,
  logoSvDark,
} from 'hds-react';
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
import styled from 'styled-components';

export type HeaderProps = {
  title?: string;
  titleUrl?: string;
  skipToContentLabel?: string;
  menuToggleAriaLabel?: string;
  languages?: OptionType<string>[];
  isNavigationVisible?: boolean;
  navigationItems?: NavigationItem[];
  customItems?: React.ReactNode[];
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
  className?: string;
  customActiveItemFn?: (url: string) => boolean;
};
const HeaderCustomItems = styled.ul`
  display: flex;
  align-items: center;
  margin-right: var(--spacing-s);
  list-style-type: none;
  margin: 0;
  > li {
    margin-right: var(--spacing-xs);
  }
`;
const HeaderV3: React.FC<HeaderProps> = ({
  skipToContentLabel,
  title,
  titleUrl,
  menuToggleAriaLabel,
  languages,
  isNavigationVisible = true,
  navigationItems,
  customItems,
  onLanguageChange,
  login,
  hideLogin,
  theme,
  onTitleClick,
  className,
  customActiveItemFn,
}) => {
  const {
    locale,
    logoLang,
    toggleMenu,
    closeMenu,
    handleLogin,
    handleLogout,
    t,
  } = useHeader(login);

  const goToPage = useGoToPage();

  const logoSrcFromLanguageAndTheme = (): string => {
    if (theme === 'dark') {
      if (logoLang === 'fi') return logoFiDark;
      if (logoLang === 'sv') return logoSvDark;
      if (logoLang === 'en') return logoFiDark;
    }
    if (logoLang === 'fi') return logoFi;
    if (logoLang === 'sv') return logoSv;
    if (logoLang === 'en') return logoFi;
    return logoFi;
  };

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
    <div data-testid="header" className={className}>
      <Header theme={theme} title={title}>
        <Header.SkipLink
          skipTo={`#${MAIN_CONTENT_ID}`}
          label={skipToContentLabel}
        />
        <Header.ActionBar
          title={title}
          titleAriaLabel={title}
          onLogoClick={onTitleClick}
          onMenuClick={toggleMenu}
          menuButtonLabel={menuToggleAriaLabel || ''}
          logo={<Logo src={logoSrcFromLanguageAndTheme()} alt="Helsinki" />}
          titleHref={titleUrl}
          onClick={onTitleClick}
          frontPageLabel={title}
        >
          {customItems && customItems.length > 0 && (
            <HeaderCustomItems key="custom-items">
              {customItems?.map((item) => (
                <li key={item.toString()}>{item}</li>
              ))}
            </HeaderCustomItems>
          )}

          {login && !login?.isAuthenticated && !hideLogin && (
            <Header.ActionBarButton
              id="login"
              label={login.loginLabel}
              onClick={() => handleLogin()}
              icon={<IconSignin />}
            />
          )}

          {login && login?.isAuthenticated && !hideLogin && (
            <Header.ActionBarItem
              id="logout"
              icon={<IconUser />}
              aria-label={`${login.userAriaLabelPrefix} ${login.userName}`}
              label={login.userName}
              // onSignIn={handleLogin}
              // authenticated={login.isAuthenticated}
              // buttonAriaLabel={
              //   login.userName
              //     ? `
              //     : ''
              // }
              onClick={() => handleLogout}
            >
              <Header.ActionBarSubItem
                label={login.logoutLabel}
                onClick={handleLogout}
                iconRight={<IconSignout />}
              />
            </Header.ActionBarItem>
          )}

          {languages && onLanguageChange && (
            <Header.LanguageSelector
              buttonAriaLabel={t('common:header.languageMenuButtonAriaLabel')}
              label={locale?.toUpperCase()}
              icon={<IconGlobe />}
              closeOnItemClick
            >
              {languages.map((option) => (
                <Header.ActionBarItem
                  id={option.value}
                  label={option.label}
                  lang={option.value}
                  onClick={(e: React.SyntheticEvent<unknown>) =>
                    onLanguageChange(e, option)
                  }
                />
              ))}
            </Header.LanguageSelector>
          )}
        </Header.ActionBar>
        {isNavigationVisible && navigationItems && (
          <Header.NavigationMenu>
            {navigationItems?.map((item) => (
              <Header.Link
                key={item.url}
                label={item.label as string}
                active={
                  customActiveItemFn
                    ? customActiveItemFn(item.url)
                    : isTabActive(item.url)
                }
                href={item.url}
                onClick={() => handleClickLink(item.url)}
              />
            ))}
          </Header.NavigationMenu>
        )}
      </Header>
    </div>
  );
};

export default HeaderV3;
