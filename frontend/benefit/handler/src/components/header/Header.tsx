import { ROUTES } from 'benefit/handler/constants';
import * as React from 'react';
import BaseHeader from 'shared/components/header/Header';

import { useHeader } from './useHeader';

const Header: React.FC = () => {
  const {
    t,
    languageOptions,
    navigationItems,
    isNavigationVisible,
    handleLanguageChange,
  } = useHeader();

  return (
    <BaseHeader
      title={t('common:appName')}
      titleUrl={ROUTES.HOME}
      menuToggleAriaLabel={t('common:menuToggleAriaLabel')}
      languages={languageOptions}
      isNavigationVisible={isNavigationVisible}
      navigationItems={navigationItems}
      onLanguageChange={handleLanguageChange}
      theme="dark"
    />
  );
};

export default Header;
