import { Button, Card } from 'hds-react';
import { useTranslation } from 'next-i18next';
import React from 'react';
import useLogin from 'tet/admin/hooks/backend/useLogin';

import { $LoginLinks } from './LoginLinks.sc';

const LoginLinks: React.FC = () => {
  const { t } = useTranslation();
  const loginAdfs = useLogin('adfs');
  const loginOidc = useLogin('oidc');

  return (
    <$LoginLinks>
      <Card
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
      >
        <Button role="link" onClick={loginOidc} data-testid="oidcLoginButton">
          {t('common:loginPage.companyLoginButton')}
        </Button>
      </Card>
      <Card
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
      >
        <Button role="link" onClick={loginAdfs} data-testid="adfsLoginButton">
          {t('common:loginPage.cityLoginButton')}
        </Button>
      </Card>
    </$LoginLinks>
  );
};

export default LoginLinks;
