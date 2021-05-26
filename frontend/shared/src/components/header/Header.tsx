import { Navigation, IconGlobe, LogoLanguage } from 'hds-react';
import React from 'react';

import { OptionType, NavigationItem } from 'shared/types/common';
import { useComponent } from './extended';

export type HeaderProps = {
  title?: string;
  locale: string;
  languages: OptionType[];
  navigationItems?: NavigationItem[];
  onLanguageChange: (language: OptionType) => void;
  onTitleClick: (callback: () => void) => void;
  onNavigationItemClick: (pathname: string) => void;
};

const Header: React.FC<HeaderProps> = ({
  title,
  languages,
  locale,
  navigationItems,
  onTitleClick,
  onNavigationItemClick,
  onLanguageChange,
}) => {
  const {
    logoLang,
    menuOpen,
    toggleMenu,
    closeMenu,
    isTabActive,
    handleNavigationItemClick,
  } = useComponent(locale, onNavigationItemClick);

  return (
    <Navigation
      menuOpen={menuOpen}
      onMenuToggle={toggleMenu}
      menuToggleAriaLabel={'header:menuToggleAriaLabel'}
      skipTo="main_content"
      skipToContentLabel={'common:linkSkipToContent'}
      onTitleClick={() => onTitleClick(closeMenu)}
      logoLanguage={logoLang as LogoLanguage}
      title={title}
    >
      {navigationItems && (
        <Navigation.Row variant="inline">
          {navigationItems?.map((item, index) => (
            <Navigation.Item
              key={index}
              active={isTabActive(item.url)}
              href={item.url}
              label={item.label}
              onClick={handleNavigationItemClick(item.url)}
              icon={item.icon}
            />
          ))}
        </Navigation.Row>
      )}
      {languages && (
        <Navigation.Actions>
          <Navigation.LanguageSelector
            buttonAriaLabel={'header:changeLanguage'}
            label={`header:languages:${locale}`}
            icon={<IconGlobe />}
            closeOnItemClick
          >
            {languages?.map((option) => (
              <Navigation.Item
                key={option.value}
                href="#"
                lang={option.value}
                label={option.label}
                onClick={() => onLanguageChange(option)}
              />
            ))}
          </Navigation.LanguageSelector>
        </Navigation.Actions>
      )}
    </Navigation>
  );
};

export default Header;
