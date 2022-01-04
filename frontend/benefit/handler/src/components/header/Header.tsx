import * as React from 'react';
import BaseHeader from 'shared/components/header/Header';
import Messenger from '../messenger/Messenger';
import { useHeader } from './useHeader';

const Header: React.FC = () => {
  const {
    t,
    locale,
    languageOptions,
    navigationItems,
    isNavigationVisible,
    handleLanguageChange,
  } = useHeader();

  return (
    <>
      <BaseHeader
        title={t('common:appName')}
        menuToggleAriaLabel={t('common:menuToggleAriaLabel')}
        languages={languageOptions}
        locale={locale}
        isNavigationVisible={isNavigationVisible}
        navigationItems={navigationItems}
        onLanguageChange={handleLanguageChange}
        theme="dark"
      />
      <Messenger />
    </>
  );
};

export default Header;
