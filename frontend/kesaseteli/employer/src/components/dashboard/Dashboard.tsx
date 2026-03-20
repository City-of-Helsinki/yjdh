import { Button, IconPlus } from 'hds-react';
import useCreateApplicationQuery from 'kesaseteli/employer/hooks/backend/useCreateApplicationQuery';
import { DashboardVoucher } from 'kesaseteli/employer/types/types';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Trans, useTranslation } from 'next-i18next';
import React from 'react';
import Container from 'shared/components/container/Container';
import { $Header, $Heading } from 'shared/components/layout/Layout.sc';
import LinkText from 'shared/components/link-text/LinkText';
import useErrorHandler from 'shared/hooks/useErrorHandler';
import useLocale from 'shared/hooks/useLocale';
import styled, { DefaultTheme } from 'styled-components';

import ApplicationTable from './ApplicationTable';

const $HeaderGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: ${(props: { theme: DefaultTheme }) => props.theme.spacing.xl};
  margin-bottom: ${(props: { theme: DefaultTheme }) => props.theme.spacing.xl};

  @media (max-width: ${(props: { theme: DefaultTheme }) =>
      props.theme.breakpoints.m}) {
    grid-template-columns: 1fr;
  }
`;

const $OrganisationName = styled.div`
  font-size: ${(props: { theme: DefaultTheme }) => props.theme.fontSize.body.l};
  line-height: 1.5;
  font-weight: bold;
`;

const $IntroText = styled.div`
  font-size: ${(props: { theme: DefaultTheme }) => props.theme.fontSize.body.l};
  line-height: 1.5;
`;

const $ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  font-size: ${(props: { theme: DefaultTheme }) => props.theme.fontSize.body.l};
  line-height: 1.5;
  gap: ${(props: { theme: DefaultTheme }) => props.theme.spacing.s};
  @media (max-width: ${(props: { theme: DefaultTheme }) =>
      props.theme.breakpoints.m}) {
    align-items: flex-start;
  }
`;

type Props = {
  vouchers: DashboardVoucher[];
  draftApplicationId?: string;
  showOnlyMine: boolean;
  onToggleOnlyMine: () => void;
  organisationName?: string;
};

const Dashboard = ({
  vouchers,
  draftApplicationId,
  showOnlyMine,
  onToggleOnlyMine,
  organisationName,
}: Props): React.ReactElement => {
  const { t } = useTranslation('common');
  const locale = useLocale();
  const router = useRouter();
  const createApplicationQuery = useCreateApplicationQuery();
  const errorHandler = useErrorHandler();

  const handleCreateNew = (): void => {
    // If a draft already exists, navigate to it (backend allows only 1 draft per company/user)
    if (draftApplicationId) {
      void router.push(`/${locale}/application?id=${draftApplicationId}`);
      return;
    }
    createApplicationQuery.mutate(undefined, {
      onError: errorHandler,
      onSuccess: (data) => {
        void router.push(`/${locale}/application?id=${data.id}`);
      },
    });
  };

  return (
    <Container>
      <Head>
        <title>{t('common:appName')}</title>
      </Head>{' '}
      as React.ReactElement
      <$Header>
        <$Heading>{t('common:dashboard.header')}</$Heading>
      </$Header>
      {organisationName && (
        <$OrganisationName>
          <p>
            {t('common:dashboard.organisationName', { name: organisationName })}
          </p>
        </$OrganisationName>
      )}
      <$HeaderGrid>
        <$IntroText>
          <p>{t('common:dashboard.welcome')}</p>
          <p>
            <Trans
              i18nKey="common:dashboard.info"
              components={{
                // href should get overridden (https://react.i18next.com/latest/trans-component#overriding-react-component-props-v11.5.0),
                // but for some reason it does not. However, the setter works, when href is left as unset.
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore ts(2741) link href and text will be set / overridden with values from translation.
                lnk: <LinkText />,
              }}
            >
              _
            </Trans>
          </p>
        </$IntroText>
        <$ButtonContainer>
          <p>{t('common:dashboard.createApplicationGuidance')}</p>
          <Button
            iconLeft={(<IconPlus aria-hidden />) as React.ReactElement}
            onClick={handleCreateNew}
            isLoading={createApplicationQuery.isLoading}
            loadingText={t('common:appName')}
          >
            {t('common:thankyouPage.createNewApplication')}
          </Button>
        </$ButtonContainer>
      </$HeaderGrid>
      <h2>{t('common:dashboard.previousApplications')}</h2>
      <ApplicationTable
        vouchers={vouchers}
        showOnlyMine={showOnlyMine}
        onToggleOnlyMine={onToggleOnlyMine}
      />
    </Container>
  ) as React.ReactElement;
};

export default Dashboard;
