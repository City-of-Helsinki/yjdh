import {
  ALL_APPLICATION_STATUSES,
  APPLICATION_LIST_TABS,
} from 'benefit/handler/constants';
import FrontPageProvider from 'benefit/handler/context/FrontPageProvider';
import { Application } from 'benefit/handler/types/application';
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
import ApplicationListForInstalments from './ApplicationListForInstalments';
import { useApplicationList } from './useApplicationList';

export interface ApplicationListProps {
  layoutBackgroundColor: string;
  list?: ApplicationListItemData[];
  isLoading: boolean;
}
const translationBase = 'common:applications.list.headings';

const isBatchStatusHandlingComplete = (batchStatus: BATCH_STATUSES): boolean =>
  [
    BATCH_STATUSES.DECIDED_ACCEPTED,
    BATCH_STATUSES.DECIDED_REJECTED,
    BATCH_STATUSES.SENT_TO_TALPA,
    BATCH_STATUSES.COMPLETED,
    BATCH_STATUSES.REJECTED_BY_TALPA,
  ].includes(batchStatus);

export const isAcceptedOrRejected = (status: APPLICATION_STATUSES): boolean =>
  [APPLICATION_STATUSES.ACCEPTED, APPLICATION_STATUSES.REJECTED].includes(
    status
  );

export const isInPayment = (
  application: ApplicationListItemData | Application
): boolean =>
  [APPLICATION_STATUSES.ACCEPTED].includes(application.status) &&
  !isString(application.batch) &&
  [BATCH_STATUSES.DECIDED_ACCEPTED, BATCH_STATUSES.REJECTED_BY_TALPA].includes(
    application?.batch?.status
  );

const HandlerIndex: React.FC<ApplicationListProps> = ({
  layoutBackgroundColor,
  list = [],
  isLoading = true,
}) => {
  const { t } = useApplicationList();

  const theme = useTheme();

  const getHeadingTranslation = (
    headingStatus:
      | APPLICATION_STATUSES
      | 'all'
      | 'pending'
      | 'inPayment'
      | 'instalments'
  ): string => t(`${translationBase}.${headingStatus}`);

  const getTabCountPending = (): number =>
    list.filter(
      (app: ApplicationListItemData) =>
        app.ahjoCaseId &&
        isAcceptedOrRejected(app.status) &&
        !isString(app.batch) &&
        !isBatchStatusHandlingComplete(app?.batch?.status)
    ).length;

  const getTabCountInstalments = (): number =>
    list.filter(
      (app: ApplicationListItemData) =>
        app.pendingInstalment && isInPayment(app)
    ).length;

  const getTabCountInPayment = (): number =>
    list.filter(
      (app: ApplicationListItemData) =>
        !isString(app.batch) &&
        [APPLICATION_STATUSES.ACCEPTED].includes(app.status) &&
        [
          BATCH_STATUSES.DECIDED_ACCEPTED,
          BATCH_STATUSES.REJECTED_BY_TALPA,
        ].includes(app?.batch?.status)
    ).length;

  const getTabCountUndecided = (): number =>
    list.filter(
      (app: ApplicationListItemData) => !isAcceptedOrRejected(app.status)
    ).length;

  const getTabCount = (
    statuses: APPLICATION_STATUSES[],
    handled?: 'inPayment' | 'pending' | 'instalments'
  ): number => {
    if (handled === 'pending') return getTabCountPending();
    if (handled === 'inPayment') return getTabCountInPayment();
    if (handled === 'instalments') return getTabCountInstalments();

    if (handled === 'all') return getTabCountUndecided();
    return list.filter((app: ApplicationListItemData) =>
      statuses.includes(app.status)
    ).length;
  };

  const getListHeadingByStatus = (
    headingStatus:
      | APPLICATION_STATUSES
      | 'all'
      | 'pending'
      | 'inPayment'
      | 'instalments',
    statuses: APPLICATION_STATUSES[]
  ): string =>
    list && list?.length > 0
      ? `${getHeadingTranslation(headingStatus)} (${getTabCount(
          statuses,
          headingStatus as 'inPayment' | 'pending' | 'instalments'
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

  const updateTabToUrl = (tabNumber: APPLICATION_LIST_TABS): void =>
    window.history.pushState({ tab }, '', `/?tab=${tabNumber}`);

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
                {getListHeadingByStatus('pending', [
                  APPLICATION_STATUSES.ACCEPTED,
                  APPLICATION_STATUSES.REJECTED,
                ])}
              </Tabs.Tab>
              <Tabs.Tab
                onClick={() => updateTabToUrl(APPLICATION_LIST_TABS.IN_PAYMENT)}
              >
                {getListHeadingByStatus('inPayment', [
                  APPLICATION_STATUSES.ACCEPTED,
                ])}
              </Tabs.Tab>
              <Tabs.Tab
                onClick={() =>
                  updateTabToUrl(APPLICATION_LIST_TABS.PENDING_INSTALMENTS)
                }
              >
                {getListHeadingByStatus('instalments', [
                  APPLICATION_STATUSES.ACCEPTED,
                ])}
              </Tabs.Tab>
            </Tabs.TabList>

            <Tabs.TabPanel>
              <ApplicationList
                isLoading={isLoading}
                list={list.filter((app) => !isAcceptedOrRejected(app.status))}
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
                    !isBatchStatusHandlingComplete(app?.batch?.status)
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
                list={list.filter((app) => isInPayment(app))}
                inPayment={!!list.filter((app) => isInPayment(app))}
                heading={t(`${translationBase}.inPayment`)}
                status={[APPLICATION_STATUSES.ACCEPTED]}
              />
            </Tabs.TabPanel>

            <Tabs.TabPanel>
              <ApplicationListForInstalments
                isLoading={isLoading}
                list={list.filter(
                  (app) => app.pendingInstalment && isInPayment(app)
                )}
                heading={t(`${translationBase}.instalments`)}
              />
            </Tabs.TabPanel>
          </Tabs>
        </Container>
      </$BackgroundWrapper>
    </FrontPageProvider>
  );
};

export default HandlerIndex;
