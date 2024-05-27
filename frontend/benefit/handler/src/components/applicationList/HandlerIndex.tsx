import { ALL_APPLICATION_STATUSES } from 'benefit/handler/constants';
import FrontPageProvider from 'benefit/handler/context/FrontPageProvider';
import { APPLICATION_STATUSES, BATCH_STATUSES } from 'benefit-shared/constants';
import { ApplicationListItemData } from 'benefit-shared/types/application';
import { LoadingSpinner, Tabs } from 'hds-react';
import { useRouter } from 'next/router';
import * as React from 'react';
import Container from 'shared/components/container/Container';
import { isString } from 'shared/utils/type-guards';
import { useTheme } from 'styled-components';

import { $BackgroundWrapper } from '../layout/Layout';
import MainIngress from '../mainIngress/MainIngress';
import ApplicationList from './ApplicationList';
import { useApplicationList } from './useApplicationList';

export interface ApplicationListProps {
  layoutBackgroundColor: string;
  list?: ApplicationListItemData[];
  isLoading: boolean;
}
const translationBase = 'common:applications.list.headings';

const HandlerIndex: React.FC<ApplicationListProps> = ({
  // heading,
  // status,
  layoutBackgroundColor,
  list = [],
  isLoading = true,
}) => {
  const { t } = useApplicationList();

  const theme = useTheme();

  const getHeadingTranslation = (
    headingStatus: APPLICATION_STATUSES | 'all' | 'pending' | 'inPayment'
  ): string => t(`${translationBase}.${headingStatus}`);

  const getTabCountPending = (): number =>
    list.filter(
      (app: ApplicationListItemData) =>
        app.ahjoCaseId &&
        !isString(app.batch) &&
        [APPLICATION_STATUSES.ACCEPTED, APPLICATION_STATUSES.REJECTED].includes(
          app.status
        ) &&
        ![
          BATCH_STATUSES.DECIDED_ACCEPTED,
          BATCH_STATUSES.DECIDED_REJECTED,
          BATCH_STATUSES.SENT_TO_TALPA,
        ].includes(app.batch.status)
    ).length;

  const getTabCountInPayment = (): number =>
    list.filter(
      (app: ApplicationListItemData) =>
        !isString(app.batch) &&
        [APPLICATION_STATUSES.ACCEPTED].includes(app.status) &&
        app.batch.status === BATCH_STATUSES.DECIDED_ACCEPTED
    ).length;

  const getTabCountAll = (): number =>
    list.filter((app: ApplicationListItemData) => !app.batch).length;

  const getTabCount = (
    statuses: APPLICATION_STATUSES[],
    handled?: 'inPayment' | 'pending'
  ): number => {
    if (handled === 'pending') return getTabCountPending();
    if (handled === 'inPayment') return getTabCountInPayment();
    if (handled === 'all') return getTabCountAll();
    return list.filter((app: ApplicationListItemData) =>
      statuses.includes(app.status)
    ).length;
  };

  const getListHeadingByStatus = (
    headingStatus: APPLICATION_STATUSES | 'all' | 'pending' | 'inPayment',
    statuses: APPLICATION_STATUSES[]
  ): string =>
    list && list?.length > 0
      ? `${getHeadingTranslation(headingStatus)} (${getTabCount(
          statuses,
          headingStatus as 'inPayment' | 'pending'
        )})`
      : getHeadingTranslation(headingStatus);

  const router = useRouter();
  const { tab } = router.query;
  const [activeTab, setActiveTab] = React.useState<number | null>(null);

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
              <Tabs.Tab>
                {getListHeadingByStatus('all', ALL_APPLICATION_STATUSES)}
              </Tabs.Tab>
              <Tabs.Tab>
                {getListHeadingByStatus(APPLICATION_STATUSES.DRAFT, [
                  APPLICATION_STATUSES.DRAFT,
                ])}
              </Tabs.Tab>
              <Tabs.Tab>
                {getListHeadingByStatus(APPLICATION_STATUSES.RECEIVED, [
                  APPLICATION_STATUSES.RECEIVED,
                ])}
              </Tabs.Tab>
              <Tabs.Tab>
                {getListHeadingByStatus(APPLICATION_STATUSES.HANDLING, [
                  APPLICATION_STATUSES.HANDLING,
                  APPLICATION_STATUSES.INFO_REQUIRED,
                ])}
              </Tabs.Tab>
              <Tabs.Tab>
                {getListHeadingByStatus('pending', [
                  APPLICATION_STATUSES.ACCEPTED,
                  APPLICATION_STATUSES.REJECTED,
                ])}
              </Tabs.Tab>
              <Tabs.Tab>
                {getListHeadingByStatus('inPayment', [
                  APPLICATION_STATUSES.ACCEPTED,
                ])}
              </Tabs.Tab>
            </Tabs.TabList>

            <Tabs.TabPanel>
              <ApplicationList
                isLoading={isLoading}
                list={list.filter((app) => !app.batch)}
                heading={t(`${translationBase}.all`)}
                status={ALL_APPLICATION_STATUSES}
              />
            </Tabs.TabPanel>

            <Tabs.TabPanel>
              <ApplicationList
                isLoading={isLoading}
                list={list.filter((app) =>
                  [APPLICATION_STATUSES.DRAFT].includes(app.status)
                )}
                heading={t(`${translationBase}.draft`)}
                status={[APPLICATION_STATUSES.DRAFT]}
              />
            </Tabs.TabPanel>

            <Tabs.TabPanel>
              <ApplicationList
                isLoading={isLoading}
                list={list.filter((app) =>
                  [APPLICATION_STATUSES.RECEIVED].includes(app.status)
                )}
                heading={t(`${translationBase}.received`)}
                status={[APPLICATION_STATUSES.RECEIVED]}
              />
            </Tabs.TabPanel>

            <Tabs.TabPanel>
              <ApplicationList
                isLoading={isLoading}
                list={list.filter((app) =>
                  [APPLICATION_STATUSES.HANDLING].includes(app.status)
                )}
                heading={t(`${translationBase}.handling`)}
                status={[APPLICATION_STATUSES.HANDLING]}
              />
              <ApplicationList
                isLoading={isLoading}
                list={list.filter((app) =>
                  [APPLICATION_STATUSES.INFO_REQUIRED].includes(app.status)
                )}
                heading={t(`${translationBase}.infoRequired`)}
                status={[APPLICATION_STATUSES.INFO_REQUIRED]}
              />
            </Tabs.TabPanel>

            <Tabs.TabPanel>
              <ApplicationList
                isLoading={isLoading}
                list={list.filter(
                  (app) =>
                    !isString(app.batch) &&
                    app.ahjoCaseId &&
                    [
                      APPLICATION_STATUSES.ACCEPTED,
                      APPLICATION_STATUSES.REJECTED,
                    ].includes(app.status) &&
                    ![
                      BATCH_STATUSES.DECIDED_ACCEPTED,
                      BATCH_STATUSES.DECIDED_REJECTED,
                    ].includes(app?.batch?.status)
                )}
                heading={t(`${translationBase}.pending`)}
                status={[
                  APPLICATION_STATUSES.ACCEPTED,
                  APPLICATION_STATUSES.REJECTED,
                ]}
              />
            </Tabs.TabPanel>

            <Tabs.TabPanel>
              <ApplicationList
                isLoading={isLoading}
                list={list.filter(
                  (app) =>
                    [APPLICATION_STATUSES.ACCEPTED].includes(app.status) &&
                    !isString(app.batch) &&
                    [BATCH_STATUSES.DECIDED_ACCEPTED].includes(
                      app?.batch?.status
                    )
                )}
                heading={t(`${translationBase}.inPayment`)}
                status={[APPLICATION_STATUSES.ACCEPTED]}
              />
            </Tabs.TabPanel>
          </Tabs>
        </Container>
      </$BackgroundWrapper>
    </FrontPageProvider>
  );
};

export default HandlerIndex;
