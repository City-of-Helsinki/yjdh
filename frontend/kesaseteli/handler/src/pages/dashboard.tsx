import { ButtonVariant, Card, IconArrowRight } from 'hds-react';
import useUser from 'kesaseteli/handler/hooks/useUser';
import { ROUTES } from 'kesaseteli-shared/constants/routes';
import { GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import React from 'react';
import Button from 'shared/components/button/Button';
import Container from 'shared/components/container/Container';
import FormSectionHeading from 'shared/components/forms/section/FormSectionHeading';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';
import styled from 'styled-components';

const $CardContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-m);
  margin-top: var(--spacing-l);
`;

const $ButtonContainer = styled.div`
  margin-top: var(--spacing-m);
`;

const $StyledCard = styled(Card)`
  background-color: var(--color-silver-light);
`;

const Dashboard: NextPage = () => {
  const { t } = useTranslation();
  const router = useRouter();

  const { user } = useUser();

  const handleYouthApplicationsClick = React.useCallback(
    () => void router.push(ROUTES.YOUTH_APPLICATIONS),
    [router]
  );

  const handleEmployerApplicationsClick = React.useCallback(
    () => void router.push(ROUTES.EMPLOYER_APPLICATIONS),
    [router]
  );

  const name = user?.name ?? '';

  return (
    <Container>
      <Head>
        <title>{t(`common:appName`)}</title>
      </Head>

      <FormSectionHeading
        size="l"
        header={t('common:header.welcome', { name })}
        as="h1"
      />

      <$CardContainer>
        <$StyledCard
          border
          heading={t('common:header.youthApplicationsLabel')}
          text={t('common:dashboard.pendingProcessed')}
        >
          <$ButtonContainer>
            <Button
              variant={ButtonVariant.Secondary}
              iconRight={<IconArrowRight />}
              onClick={handleYouthApplicationsClick}
            >
              {t('common:header.youthApplicationsLabel')}
            </Button>
          </$ButtonContainer>
        </$StyledCard>

        <$StyledCard
          border
          heading={t('common:header.employerApplicationsLabel')}
          text={t('common:dashboard.pendingProcessed')}
        >
          <$ButtonContainer>
            <Button
              variant={ButtonVariant.Secondary}
              iconRight={<IconArrowRight />}
              onClick={handleEmployerApplicationsClick}
            >
              {t('common:header.employerApplicationsLabel')}
            </Button>
          </$ButtonContainer>
        </$StyledCard>
      </$CardContainer>
    </Container>
  );
};

export const getStaticProps: GetStaticProps =
  getServerSideTranslations('common');

export default Dashboard;
