import {
  Header as HdsHeader,
  IconSignin,
  IconSignout,
  IconUser,
  Logo,
  logoFi,
  logoFiDark,
  LogoSize,
  logoSv,
  logoSvDark,
} from 'hds-react';
import React from 'react';
import { MAIN_CONTENT_ID } from 'shared/constants';
import useGoToPage from 'shared/hooks/useGoToPage';
import theme from 'shared/styles/theme';
import { NavigationItem, OptionType, ThemeOption } from 'shared/types/common';
import { isTabActive } from 'shared/utils/menu.utils';

import { useHeader } from './useHeader';
import { useRouter } from 'next/router';

const mainTheme = theme;

export type HeaderProps = {
  title?: string;
  titleUrl?: string;
  skipToContentLabel?: string;
  menuToggleAriaLabel?: string;
  languages?: OptionType<string>[];
  isNavigationVisible?: boolean;
  navigationItems?: NavigationItem[];
  customItems?: React.ReactNode;
  onLanguageChange?: (language: string) => void;
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
  className?: string;
  customActiveItemFn?: (url: string) => boolean;
};

const Header: React.FC<HeaderProps> = ({
  className,
  customActiveItemFn,
  customItems,
  hideLogin,
  isNavigationVisible = true,
  languages,
  login,
  menuToggleAriaLabel,
  navigationItems,
  onLanguageChange,
  skipToContentLabel,
  // eslint-disable-next-line @typescript-eslint/no-shadow
  theme,
  title,
  titleUrl,
}) => {
  const router = useRouter();
  const { locale } = router;

  const { closeMenu, handleLogin, handleLogout, logoLang, t, toggleMenu } =
    useHeader(login);

  const goToPage = useGoToPage();

  const languageOptions = React.useMemo(
    () =>
      languages?.map(({ label, value }) => ({
        label,
        value,
        isPrimary: true,
      })) || [],
    [languages]
  );

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
    <div
      data-testid="header"
      className={className}
      style={
        {
          '--header-max-width': mainTheme.headerWidth.max,
        } as React.CSSProperties
      }
    >
      <HdsHeader
        theme={theme}
        onDidChangeLanguage={onLanguageChange}
        defaultLanguage={locale}
        languages={languageOptions}
      >
        <HdsHeader.SkipLink
          skipTo={`#${MAIN_CONTENT_ID}`}
          label={skipToContentLabel || ''}
        />
        <HdsHeader.ActionBar
          frontPageLabel={title || ''}
          title={title || ''}
          titleAriaLabel={title || ''}
          titleHref={titleUrl || ''}
          logo={
            <Logo
              alt="Helsinki"
              size={LogoSize.Large}
              src={logoSrcFromLanguageAndTheme()}
            />
          }
          logoHref={titleUrl || ''}
          menuButtonLabel={menuToggleAriaLabel || ''}
          onMenuClick={toggleMenu}
        >
          {customItems}
          {login && !login?.isAuthenticated && !hideLogin && (
            <HdsHeader.ActionBarButton
              label={login.loginLabel}
              // @ts-ignore
              onClick={() => handleLogin()}
              icon={<IconSignin />}
              fixedRightPosition
            />
          )}

          <div className="flex items-center space-x-4" />

          {login && login?.isAuthenticated && !hideLogin && (
            <HdsHeader.ActionBarItem
              id="sign-out"
              icon={<IconUser />}
              aria-label={`${login.userAriaLabelPrefix} ${login.userName}`}
              label={login.userName}
              fixedRightPosition
            >
              <HdsHeader.ActionBarSubItem
                label={login.logoutLabel}
                onClick={handleLogout}
                iconStart={<IconSignout />}
              />
            </HdsHeader.ActionBarItem>
          )}

          {languages && onLanguageChange && (
            <HdsHeader.LanguageSelector
              ariaLabel={t('common:header.languageMenuButtonAriaLabel')}
            />
          )}
        </HdsHeader.ActionBar>
        {isNavigationVisible && navigationItems && (
          <HdsHeader.NavigationMenu>
            {navigationItems?.map((item) => (
              <HdsHeader.Link
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
          </HdsHeader.NavigationMenu>
        )}
      </HdsHeader>
    </div>
  );
};

export default Header;
