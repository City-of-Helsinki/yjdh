import dynamic from 'next/dynamic';
import { useTranslation } from 'next-i18next';
import React from 'react';
import useLogin from 'tet/admin/hooks/backend/useLogin';

import { $LoginLinks } from './LoginLinks.sc';

// Need to import Footer dynamically because currently HDS has issues with SSR
const DynamicCardWrapper = dynamic(() => import('./CardWrapper'), {
  ssr: false,
});

const LoginLinks: React.FC = () => {
  const { t } = useTranslation();
  const loginAdfs = useLogin('adfs');
  const loginOidc = useLogin('oidc');

  return (
    <$LoginLinks>
      <DynamicCardWrapper
        border
        heading={t('common:loginPage.companyLoginHeading')}
        text={t('common:loginPage.companyLoginText')}
        theme={{
          '--background-color': 'var(--color-white)',
          '--border-color': 'var(--color-coat-of-arms)',
          '--border-width': '3px',
          '--color': 'var(--color-black-90)',
          '--padding-horizontal': 'var(--spacing-l)',
          '--padding-vertical': 'var(--spacing-m)',
        }}
        buttonText={t('common:loginPage.companyLoginButton')}
        onClick={loginOidc}
        dataTestId="oidcLoginButton"
      />
      <DynamicCardWrapper
        border
        heading={t('common:loginPage.cityLoginHeading')}
        text={t('common:loginPage.cityLoginText')}
        theme={{
          '--background-color': 'var(--color-white)',
          '--border-color': 'var(--color-summer)',
          '--border-width': '3px',
          '--color': 'var(--color-black-90)',
          '--padding-horizontal': 'var(--spacing-l)',
          '--padding-vertical': 'var(--spacing-m)',
        }}
        buttonText={t('common:loginPage.cityLoginButton')}
        onClick={loginAdfs}
        dataTestId="adfsLoginButton"
      />
    </$LoginLinks>
  );
};

export default LoginLinks;
