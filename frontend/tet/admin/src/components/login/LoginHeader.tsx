import { useTranslation } from 'next-i18next';
import React from 'react';
import Container from 'shared/components/container/Container';

import { $LoginHeader, $LoginHeaderSubtitle, $LoginHeaderTitle } from './LoginHeader.sc';

const LoginHeader: React.FC = () => {
  const { t } = useTranslation();

  return (
    <$LoginHeader>
      <Container>
        <$LoginHeaderTitle>{t('common:loginPage.pageHeading')}</$LoginHeaderTitle>
        <$LoginHeaderSubtitle>{t('common:loginPage.pageText')}</$LoginHeaderSubtitle>
      </Container>
    </$LoginHeader>
  );
};

export default LoginHeader;
