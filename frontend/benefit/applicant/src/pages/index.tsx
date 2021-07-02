import ApplicationsList from 'benefit/applicant/components/applications/applicationList/ApplicationList';
import MainIngress from 'benefit/applicant/components/mainIngress/MainIngress';
import { useTranslation } from 'benefit/applicant/i18n';
import { GetStaticProps, NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import * as React from 'react';

import useApplicationQuery from '../hooks/useApplicationQuery';

const ApplicantIndex: NextPage = () => {
  const {
    data: draftData,
    error: draftError,
    isLoading: draftIsLoading,
  } = useApplicationQuery(['draft']);
  const {
    data: submittedData,
    error: submittedError,
    isLoading: submittedIsLoading,
  } = useApplicationQuery([
    'received',
    'additional_information_needed',
    'cancelled',
    'accepted',
    'rejected',
  ]);
  const { t } = useTranslation();

  const draftErrArr = draftError ? [draftError] : [];
  const submitErrArr = submittedError ? [submittedError] : [];

  return (
    <>
      <MainIngress errors={[...draftErrArr, ...submitErrArr]} />
      <ApplicationsList
        heading={t('common:applications.list.drafts.heading')}
        data={draftData ?? []}
        isLoading={draftIsLoading}
      />
      <ApplicationsList
        heading={t('common:applications.list.submitted.heading')}
        data={submittedData ?? []}
        isLoading={submittedIsLoading}
      />
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale || '', ['common'])),
  },
});

export default ApplicantIndex;
