import * as React from 'react';
import BaseHeader from 'shared/components/header/Header';

import { useHeader } from './useHeader';

const Header: React.FC = () => {
  const {
    t,
    locale,
    languageOptions,
    navigationItems,
    isNavigationVisible,
    handleLanguageChange,
    handleNavigationItemClick,
    handleTitleClick,
  } = useHeader();

  return (
    <BaseHeader
      title={t('common:appName')}
      menuToggleAriaLabel={t('common:menuToggleAriaLabel')}
      languages={languageOptions}
      locale={locale}
      isNavigationVisible={isNavigationVisible}
      navigationItems={navigationItems}
      onLanguageChange={handleLanguageChange}
      onNavigationItemClick={handleNavigationItemClick}
      onTitleClick={handleTitleClick}
      theme="dark"
    />
  );
};

export default Header;
