import ApplicationsList from 'benefit/applicant/components/applications/applicationList/ApplicationList';
import MainIngress from 'benefit/applicant/components/mainIngress/MainIngress';
import { useTranslation } from 'benefit/applicant/i18n';
import { GetStaticProps, NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import * as React from 'react';

import FrontPageProvider from '../context/FrontPageProvider';

const ApplicantIndex: NextPage = () => {
  const { t } = useTranslation();

  return (
    <FrontPageProvider>
      <MainIngress />
      <ApplicationsList
        heading={t('common:applications.list.drafts.heading')}
        status={['draft']}
      />
      <ApplicationsList
        heading={t('common:applications.list.submitted.heading')}
        status={[
          'received',
          'additional_information_needed',
          'cancelled',
          'accepted',
          'rejected',
        ]}
      />
    </FrontPageProvider>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale || '', ['common'])),
  },
});

export default ApplicantIndex;
