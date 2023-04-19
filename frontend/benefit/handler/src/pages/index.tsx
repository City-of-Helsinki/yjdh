import ApplicationList from 'benefit/handler/components/applicationList/ApplicationList';
import ApplicationsHandled from 'benefit/handler/components/batchProcessing/ApplicationsHandled';
import MainIngress from 'benefit/handler/components/mainIngress/MainIngress';
import AppContext from 'benefit/handler/context/AppContext';
import FrontPageProvider from 'benefit/handler/context/FrontPageProvider';
import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import { Tabs } from 'hds-react';
import { GetStaticProps, NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import * as React from 'react';
import { useEffect } from 'react';
import Container from 'shared/components/container/Container';
import theme from 'shared/styles/theme';

import { useApplicationList } from '../components/applicationList/useApplicationList';
import { $BackgroundWrapper } from '../components/layout/Layout';

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

  const { t, list } = useApplicationList(
    [
      APPLICATION_STATUSES.RECEIVED,
      APPLICATION_STATUSES.HANDLING,
      APPLICATION_STATUSES.INFO_REQUIRED,
      APPLICATION_STATUSES.ACCEPTED,
      APPLICATION_STATUSES.REJECTED,
    ],
    true
  );

  const getListLengthByStatus = (statuses: APPLICATION_STATUSES[]): number =>
    list && list?.length > 0
      ? list.filter((app) => statuses.includes(app.status)).length
      : 0;

  return (
    <FrontPageProvider>
      <$BackgroundWrapper backgroundColor={layoutBackgroundColor}>
        <MainIngress />
        <Container>
          <Tabs theme={theme.components.tabs}>
            <Tabs.TabList style={{ marginBottom: 'var(--spacing-m)' }}>
              <Tabs.Tab>
                {t(`${translationBase}.all`)} (
                {getListLengthByStatus([
                  APPLICATION_STATUSES.RECEIVED,
                  APPLICATION_STATUSES.HANDLING,
                  APPLICATION_STATUSES.INFO_REQUIRED,
                ])}
                )
              </Tabs.Tab>
              <Tabs.Tab>
                {t(`${translationBase}.received`)} (
                {getListLengthByStatus([APPLICATION_STATUSES.RECEIVED])})
              </Tabs.Tab>
              <Tabs.Tab>
                {t(`${translationBase}.handling`)} (
                {getListLengthByStatus([
                  APPLICATION_STATUSES.HANDLING,
                  APPLICATION_STATUSES.INFO_REQUIRED,
                ])}
                )
              </Tabs.Tab>
              <Tabs.Tab>
                {t(`${translationBase}.accepted`)} (
                {getListLengthByStatus([APPLICATION_STATUSES.ACCEPTED])})
              </Tabs.Tab>
              <Tabs.Tab>
                {t(`${translationBase}.rejected`)} (
                {getListLengthByStatus([APPLICATION_STATUSES.REJECTED])})
              </Tabs.Tab>
            </Tabs.TabList>

            <Tabs.TabPanel>
              <ApplicationList
                heading={t(`${translationBase}.received`)}
                status={[APPLICATION_STATUSES.RECEIVED]}
              />
              <ApplicationList
                heading={t(`${translationBase}.handling`)}
                status={[APPLICATION_STATUSES.HANDLING]}
              />
              <ApplicationList
                heading={t(`${translationBase}.infoRequired`)}
                status={[APPLICATION_STATUSES.INFO_REQUIRED]}
              />
            </Tabs.TabPanel>

            <Tabs.TabPanel>
              <ApplicationList
                heading={t(`${translationBase}.received`)}
                status={[APPLICATION_STATUSES.RECEIVED]}
              />
            </Tabs.TabPanel>

            <Tabs.TabPanel>
              <ApplicationList
                heading={t(`${translationBase}.handling`)}
                status={[APPLICATION_STATUSES.HANDLING]}
              />
              <ApplicationList
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
