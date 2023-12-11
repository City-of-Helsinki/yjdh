import { $Heading } from 'benefit/handler/components/applicationList/ApplicationList.sc';
import BatchProposals from 'benefit/handler/components/batchProcessing/BatchProposals';
import { $BackgroundWrapper } from 'benefit/handler/components/layout/Layout';
import AppContext from 'benefit/handler/context/AppContext';
import { BATCH_STATUSES } from 'benefit-shared/constants';
import { Tabs } from 'hds-react';
import { GetStaticProps, NextPage } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import * as React from 'react';
import { useEffect } from 'react';
import Container from 'shared/components/container/Container';
import theme from 'shared/styles/theme';

const BatchIndex: NextPage = () => {
  const {
    setIsFooterVisible,
    setIsNavigationVisible,
    setLayoutBackgroundColor,
    layoutBackgroundColor,
  } = React.useContext(AppContext);

  const { t } = useTranslation();

  useEffect(() => {
    setIsNavigationVisible(true);
    setIsFooterVisible(true);
    setLayoutBackgroundColor(theme.colors.silverLight);
    return () => {
      setIsNavigationVisible(false);
      setIsFooterVisible(true);
      setLayoutBackgroundColor(theme.colors.silverLight);
    };
  }, [setIsFooterVisible, setIsNavigationVisible, setLayoutBackgroundColor]);

  return (
    <$BackgroundWrapper backgroundColor={layoutBackgroundColor}>
      <Container data-testid="batch-proposal">
        <$Heading data-testid="main-ingress">
          {`${t('common:header.navigation.batches')}`}
        </$Heading>

        <Tabs>
          <Tabs.TabList style={{ marginBottom: 'var(--spacing-m)' }}>
            <Tabs.Tab>{t('common:batches.tabs.pending')}</Tabs.Tab>
            <Tabs.Tab>{t('common:batches.tabs.inspection')}</Tabs.Tab>
            <Tabs.Tab>{t('common:batches.tabs.completion')}</Tabs.Tab>
          </Tabs.TabList>

          <Tabs.TabPanel>
            <$Heading>{t('common:batches.tabs.pending')}</$Heading>
            <BatchProposals
              status={[
                BATCH_STATUSES.DRAFT,
                BATCH_STATUSES.AHJO_REPORT_CREATED,
              ]}
            />
          </Tabs.TabPanel>

          <Tabs.TabPanel>
            <$Heading>{t('common:batches.tabs.inspection')}</$Heading>
            <BatchProposals status={[BATCH_STATUSES.AWAITING_FOR_DECISION]} />
          </Tabs.TabPanel>
          <Tabs.TabPanel>
            <$Heading>{t('common:batches.tabs.completion')}</$Heading>
            <BatchProposals status={[BATCH_STATUSES.DECIDED_ACCEPTED]} />
          </Tabs.TabPanel>
        </Tabs>
      </Container>
    </$BackgroundWrapper>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale || '', ['common'])),
  },
});

export default BatchIndex;
