import { IconMover } from 'hds-react';
import { useTranslation } from 'next-i18next';
import React from 'react';
import BaseHeader from 'shared/components/header/Header';
import useLocale from 'shared/hooks/useLocale';

const Header: React.FC = () => {
  const { t } = useTranslation();
  const locale = useLocale();
  const navigationItems = [
    {
      label: t('common:header.createApplicationWithoutSsnLabel'),
      url: '/create-application-without-ssn/',
      icon: <IconMover />,
    },
  ];

  return (
    <BaseHeader
      title={t('common:appName')}
      titleUrl={`/${locale}`}
      skipToContentLabel={t('common:header.linkSkipToContent')}
      menuToggleAriaLabel={t('common:header.menuToggleAriaLabel')}
      isNavigationVisible
      navigationItems={navigationItems}
      theme="dark"
    />
  );
};

export default Header;
