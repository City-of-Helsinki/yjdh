import * as React from 'react';
import { useComponent } from './extended';
import BaseHeader from 'shared/components/header/Header';

const Header: React.FC = () => {
  const {
    t,
    locale,
    languageOptions,
    navigationItems,
    handleLanguageChange,
    handleNavigationItemClick,
    handleTitleClick,
  } = useComponent();

  return (
    <BaseHeader
      title={t('common:appName')}
      menuToggleAriaLabel={t('common:menuToggleAriaLabel')}
      languages={languageOptions}
      navigationItems={navigationItems}
      locale={locale}
      onLanguageChange={handleLanguageChange}
      onNavigationItemClick={handleNavigationItemClick}
      onTitleClick={handleTitleClick}
    />
  );
};

export default Header;
