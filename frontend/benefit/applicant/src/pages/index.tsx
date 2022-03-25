import ApplicationsList from 'benefit/applicant/components/applications/applicationList/ApplicationList';
import MainIngress from 'benefit/applicant/components/mainIngress/MainIngress';
import { useTranslation } from 'benefit/applicant/i18n';
import { GetStaticProps, NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import * as React from 'react';
import withAuth from 'shared/components/hocs/withAuth';

import SupportingContent from '../components/supportingContent/SupportingContent';
import { SUBMITTED_STATUSES } from '../constants';
import FrontPageProvider from '../context/FrontPageProvider';

const ApplicantIndex: NextPage = () => {
  const { t } = useTranslation();

  return (
    <FrontPageProvider>
      <MainIngress />
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
      <SupportingContent />
    </FrontPageProvider>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale || '', ['common'])),
  },
});

export default withAuth(ApplicantIndex);
