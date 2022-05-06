import { useTranslation } from 'next-i18next';
import { $LoginHeader, $LoginHeaderTitle, $LoginHeaderSubtitle } from './LoginHeader.sc';
import Container from 'shared/components/container/Container';

const LoginHeader = () => {
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
