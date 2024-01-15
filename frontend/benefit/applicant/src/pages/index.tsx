import ApplicationsList from 'benefit/applicant/components/applications/applicationList/ApplicationList';
import FrontPageMainIngress from 'benefit/applicant/components/mainIngress/frontPage/FrontPageMainIngress';
import PrerequisiteReminder from 'benefit/applicant/components/prerequisiteReminder/PrerequisiteReminder';
import AppContext from 'benefit/applicant/context/AppContext';
import { useTranslation } from 'benefit/applicant/i18n';
import { GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import * as React from 'react';
import { useEffect } from 'react';
import withAuth from 'shared/components/hocs/withAuth';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';

import { SUBMITTED_STATUSES } from '../constants';
import FrontPageProvider from '../context/FrontPageProvider';

const ApplicantIndex: NextPage = () => {
  const { t } = useTranslation();
  const { setIsNavigationVisible } = React.useContext(AppContext);

  useEffect(() => {
    setIsNavigationVisible(true);

    return () => {
      setIsNavigationVisible(false);
    };
  }, [setIsNavigationVisible]);

  return (
    <>
      <Head>
        <title>{t('common:appName')}</title>
      </Head>
      <FrontPageProvider>
        <FrontPageMainIngress />
        <ApplicationsList
          heading={t('common:applications.list.moreInfo.heading')}
          status={['additional_information_needed']}
        />
        <ApplicationsList
          heading={t('common:applications.list.drafts.heading')}
          status={['draft']}
        />
        <ApplicationsList
          heading={t('common:applications.list.submitted.heading')}
          status={SUBMITTED_STATUSES}
        />
        <PrerequisiteReminder />
      </FrontPageProvider>
    </>
  );
};

export const getStaticProps: GetStaticProps =
  getServerSideTranslations('common');

export default withAuth(ApplicantIndex);
