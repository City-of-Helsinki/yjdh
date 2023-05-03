import { $Heading } from 'benefit/handler/components/applicationsArchive/ApplicationsArchive.sc';
import BatchProposals from 'benefit/handler/components/batchProcessing/BatchProposals';
import { $BackgroundWrapper } from 'benefit/handler/components/layout/Layout';
import AppContext from 'benefit/handler/context/AppContext';
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
          </Tabs.TabList>

          <Tabs.TabPanel>
            <BatchProposals />
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
