import ApplicationList from 'benefit/applicant/components/applications/applicationList/ApplicationList';
import { $ListActionButtonContainer } from 'benefit/applicant/components/applications/applicationList/ApplicationList.sc';
import ExpandableApplicationList from 'benefit/applicant/components/applications/applicationList/ExpandableApplicationList';
import NoApplications from 'benefit/applicant/components/applications/NoApplications';
import FrontPageMainIngress from 'benefit/applicant/components/mainIngress/frontPage/FrontPageMainIngress';
import PrerequisiteReminder from 'benefit/applicant/components/prerequisiteReminder/PrerequisiteReminder';
import AppContext from 'benefit/applicant/context/AppContext';
import { useTranslation } from 'benefit/applicant/i18n';
import { Button, IconArrowRight } from 'hds-react';
import { GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useQueryClient } from 'react-query';
import withAuth from 'shared/components/hocs/withAuth';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';

import { ROUTES, SUBMITTED_STATUSES } from '../constants';
import FrontPageProvider from '../context/FrontPageProvider';

const ApplicantIndex: NextPage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { setIsNavigationVisible } = React.useContext(AppContext);

  useEffect(() => {
    setIsNavigationVisible(true);

    return () => {
      setIsNavigationVisible(false);
    };
  }, [setIsNavigationVisible]);

  /**
   * Fix a cache issue where single application's button opens up a read-only
   * application if status changes to "additional_information_needed"
   */
  const effectInvalidateApplicationsCache = () =>
    void queryClient.invalidateQueries('applications');
  useEffect(effectInvalidateApplicationsCache, [queryClient]);

  const [infoNeededCount, setInfoNeededCount] = useState<number | null>(null);
  const [draftCount, setDraftCount] = useState<number | null>(null);
  const [submittedCount, setSubmittedCount] = useState<number | null>(null);

  const onInfoNeededChange = useCallback(
    (isLoading: boolean, count: number) =>
      setInfoNeededCount(isLoading ? null : count),
    []
  );
  const onDraftChange = useCallback(
    (isLoading: boolean, count: number) =>
      setDraftCount(isLoading ? null : count),
    []
  );
  const onSubmittedChange = useCallback(
    (isLoading: boolean, count: number) =>
      setSubmittedCount(isLoading ? null : count),
    []
  );

  const noApplications = [infoNeededCount, draftCount, submittedCount].every(
    (item) => item === 0
  );

  return (
    <>
      <Head>
        <title>{t('common:appName')}</title>
      </Head>
      <FrontPageProvider>
        <FrontPageMainIngress />
        {noApplications ? (
          <NoApplications />
        ) : (
          <>
            <ExpandableApplicationList
              heading={t('common:applications.list.moreInfo.heading')}
              status={['additional_information_needed']}
              initialItems={4}
              onListLengthChanged={onInfoNeededChange}
            />
            <ExpandableApplicationList
              heading={t('common:applications.list.drafts.heading')}
              status={['draft']}
              orderByOptions={[
                {
                  label: t('common:sortOrder.modifiedAt.desc'),
                  value: '-modified_at',
                },
              ]}
              initialItems={4}
              onListLengthChanged={onDraftChange}
            />
            <ApplicationList
              heading={t('common:applications.list.submitted.heading')}
              status={SUBMITTED_STATUSES}
              isArchived={false}
              onListLengthChanged={onSubmittedChange}
            >
              <$ListActionButtonContainer>
                <Button
                  onClick={() => router.push(ROUTES.DECISIONS)}
                  variant="secondary"
                  theme="black"
                  iconRight={<IconArrowRight />}
                >
                  {t('common:applications.list.navigateToDecisions')}
                </Button>
              </$ListActionButtonContainer>
            </ApplicationList>
          </>
        )}
        <PrerequisiteReminder />
      </FrontPageProvider>
    </>
  );
};

export const getStaticProps: GetStaticProps =
  getServerSideTranslations('common');

export default withAuth(ApplicantIndex);
