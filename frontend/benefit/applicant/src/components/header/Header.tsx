import * as React from 'react';
import BaseHeader from 'shared/components/header/Header';

import { useComponent } from './extended';

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
