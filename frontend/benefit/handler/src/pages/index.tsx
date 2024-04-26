import ApplicationList from 'benefit/handler/components/applicationList/ApplicationList';
import ApplicationsHandled from 'benefit/handler/components/batchProcessing/ApplicationsHandled';
import MainIngress from 'benefit/handler/components/mainIngress/MainIngress';
import AppContext from 'benefit/handler/context/AppContext';
import FrontPageProvider from 'benefit/handler/context/FrontPageProvider';
import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import { ApplicationListItemData } from 'benefit-shared/types/application';
import { LoadingSpinner, Tabs } from 'hds-react';
import { GetStaticProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import * as React from 'react';
import { useEffect } from 'react';
import Container from 'shared/components/container/Container';
import theme from 'shared/styles/theme';

import { useApplicationList } from '../components/applicationList/useApplicationList';
import { useApplicationListData } from '../components/applicationList/useApplicationListData';
import { $BackgroundWrapper } from '../components/layout/Layout';
import { ALL_APPLICATION_STATUSES, APPLICATION_LIST_TABS } from '../constants';

const ApplicantIndex: NextPage = () => {
  const {
    setIsFooterVisible,
    setIsNavigationVisible,
    setLayoutBackgroundColor,
    layoutBackgroundColor,
  } = React.useContext(AppContext);

  // configure page specific settings
  useEffect(() => {
    setIsNavigationVisible(true);
    setIsFooterVisible(true);
    setLayoutBackgroundColor(theme.colors.silverLight);
    return () => {
      setIsNavigationVisible(false);
      setLayoutBackgroundColor(theme.colors.silver);
    };
  }, [setIsFooterVisible, setIsNavigationVisible, setLayoutBackgroundColor]);

  const translationBase = 'common:applications.list.headings';

  const { list, shouldShowSkeleton } = useApplicationListData(
    ALL_APPLICATION_STATUSES,
    true
  );
  const { t } = useApplicationList();

  const getHeadingTranslation = (
    headingStatus: APPLICATION_STATUSES | 'all'
  ): string => t(`${translationBase}.${headingStatus}`);

  const getTabCount = (statuses: APPLICATION_STATUSES[]): number =>
    list.filter((app: ApplicationListItemData) => statuses.includes(app.status))
      .length;

  const getListHeadingByStatus = (
    headingStatus: APPLICATION_STATUSES | 'all',
    statuses: APPLICATION_STATUSES[]
  ): string =>
    list && list?.length > 0
      ? `${getHeadingTranslation(headingStatus)} (${getTabCount(statuses)})`
      : getHeadingTranslation(headingStatus);

  const router = useRouter();
  const { tab } = router.query;
  const [activeTab, setActiveTab] = React.useState<number | null>(null);
  const updateTabToUrl = (tabNumber: APPLICATION_LIST_TABS): void =>
    window.history.pushState({ tab }, '', `/?tab=${tabNumber}`);

  React.useEffect(() => {
    if (!router.isReady) return;
    setActiveTab(parseInt(tab as string, 10) || 0);
  }, [router.isReady, tab]);

  if (activeTab === null) {
    return (
      <div style={{ margin: theme.spacing.xl }}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <FrontPageProvider>
      <$BackgroundWrapper backgroundColor={layoutBackgroundColor}>
        <MainIngress />
        <Container>
          <Tabs theme={theme.components.tabs} initiallyActiveTab={activeTab}>
            <Tabs.TabList style={{ marginBottom: 'var(--spacing-m)' }}>
              <Tabs.Tab
                onClick={() => updateTabToUrl(APPLICATION_LIST_TABS.ALL)}
              >
                {getListHeadingByStatus('all', ALL_APPLICATION_STATUSES)}
              </Tabs.Tab>
              <Tabs.Tab
                onClick={() => updateTabToUrl(APPLICATION_LIST_TABS.DRAFT)}
              >
                {getListHeadingByStatus(APPLICATION_STATUSES.DRAFT, [
                  APPLICATION_STATUSES.DRAFT,
                ])}
              </Tabs.Tab>
              <Tabs.Tab
                onClick={() => updateTabToUrl(APPLICATION_LIST_TABS.RECEIVED)}
              >
                {getListHeadingByStatus(APPLICATION_STATUSES.RECEIVED, [
                  APPLICATION_STATUSES.RECEIVED,
                ])}
              </Tabs.Tab>
              <Tabs.Tab
                onClick={() => updateTabToUrl(APPLICATION_LIST_TABS.HANDLING)}
              >
                {getListHeadingByStatus(APPLICATION_STATUSES.HANDLING, [
                  APPLICATION_STATUSES.HANDLING,
                  APPLICATION_STATUSES.INFO_REQUIRED,
                ])}
              </Tabs.Tab>
              <Tabs.Tab
                onClick={() => updateTabToUrl(APPLICATION_LIST_TABS.ACCEPTED)}
              >
                {getListHeadingByStatus(APPLICATION_STATUSES.ACCEPTED, [
                  APPLICATION_STATUSES.ACCEPTED,
                ])}
              </Tabs.Tab>
              <Tabs.Tab
                onClick={() => updateTabToUrl(APPLICATION_LIST_TABS.REJECTED)}
              >
                {getListHeadingByStatus(APPLICATION_STATUSES.REJECTED, [
                  APPLICATION_STATUSES.REJECTED,
                ])}
              </Tabs.Tab>
            </Tabs.TabList>

            <Tabs.TabPanel>
              <ApplicationList
                isLoading={shouldShowSkeleton}
                list={list}
                heading={t(`${translationBase}.all`)}
                status={ALL_APPLICATION_STATUSES}
              />
            </Tabs.TabPanel>

            <Tabs.TabPanel>
              <ApplicationList
                isLoading={shouldShowSkeleton}
                list={list.filter((app) =>
                  [APPLICATION_STATUSES.DRAFT].includes(app.status)
                )}
                heading={t(`${translationBase}.draft`)}
                status={[APPLICATION_STATUSES.DRAFT]}
              />
            </Tabs.TabPanel>

            <Tabs.TabPanel>
              <ApplicationList
                isLoading={shouldShowSkeleton}
                list={list.filter((app) =>
                  [APPLICATION_STATUSES.RECEIVED].includes(app.status)
                )}
                heading={t(`${translationBase}.received`)}
                status={[APPLICATION_STATUSES.RECEIVED]}
              />
            </Tabs.TabPanel>

            <Tabs.TabPanel>
              <ApplicationList
                isLoading={shouldShowSkeleton}
                list={list.filter((app) =>
                  [APPLICATION_STATUSES.HANDLING].includes(app.status)
                )}
                heading={t(`${translationBase}.handling`)}
                status={[APPLICATION_STATUSES.HANDLING]}
              />
              <ApplicationList
                isLoading={shouldShowSkeleton}
                list={list.filter((app) =>
                  [APPLICATION_STATUSES.INFO_REQUIRED].includes(app.status)
                )}
                heading={t(`${translationBase}.infoRequired`)}
                status={[APPLICATION_STATUSES.INFO_REQUIRED]}
              />
            </Tabs.TabPanel>

            <Tabs.TabPanel>
              <ApplicationsHandled
                status={APPLICATION_STATUSES.ACCEPTED}
                excludeBatched
              />
            </Tabs.TabPanel>

            <Tabs.TabPanel>
              <ApplicationsHandled
                status={APPLICATION_STATUSES.REJECTED}
                excludeBatched
              />
            </Tabs.TabPanel>
          </Tabs>
        </Container>
      </$BackgroundWrapper>
    </FrontPageProvider>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale || '', ['common'])),
  },
});

export default ApplicantIndex;
