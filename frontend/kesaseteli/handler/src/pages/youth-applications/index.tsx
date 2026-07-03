import { ButtonVariant, IconPlus } from 'hds-react';
import YouthApplicationList from 'kesaseteli/handler/components/applicationList/YouthApplicationList';
import useUserQuery from 'kesaseteli/handler/hooks/backend/useUserQuery';
import { ROUTES } from 'kesaseteli-shared/constants/routes';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import React from 'react';
import Button from 'shared/components/button/Button';
import Container from 'shared/components/container/Container';
import FormSectionHeading from 'shared/components/forms/section/FormSectionHeading';
import PageLoadingSpinner from 'shared/components/pages/PageLoadingSpinner';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';
import styled from 'styled-components';

const $CreateButtonContainer = styled.div`
  margin-top: var(--spacing-m);
  margin-bottom: var(--spacing-l);
`;

function YouthApplicationsIndex(): React.ReactElement {
  const { t } = useTranslation();
  const router = useRouter();

  const handleCreateWithoutSsnClick = React.useCallback(
    () => void router.push(ROUTES.CREATE_APPLICATION_WITHOUT_SSN),
    [router]
  );

  const { isLoading: isUserLoading } = useUserQuery({
    enabled: true,
  });

  if (isUserLoading) {
    return <PageLoadingSpinner />;
  }

  return (
    <Container>
      <Head>
        <title>{t('common:appName')}</title>
      </Head>
      <FormSectionHeading
        size="l"
        header={t('common:header.youthApplicationsLabel')}
        as="h1"
      />
      <$CreateButtonContainer>
        <Button
          variant={ButtonVariant.Secondary}
          iconStart={<IconPlus aria-hidden />}
          onClick={handleCreateWithoutSsnClick}
        >
          {t('common:header.createApplicationWithoutSsnLabel')}
        </Button>
      </$CreateButtonContainer>
      <YouthApplicationList />
    </Container>
  );
}

export const getStaticProps: GetStaticProps =
  getServerSideTranslations('common');

export default YouthApplicationsIndex;
