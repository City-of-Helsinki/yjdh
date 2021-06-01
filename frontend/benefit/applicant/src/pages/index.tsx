import DraftApplicationsList from 'benefit/applicant/components/applications/draftsList/DraftsList';
import SubmittedApplicationsList from 'benefit/applicant/components/applications/submittedList/SubmittedList';
import MainIngress from 'benefit/applicant/components/mainIngress/MainIngress';
import { GetStaticProps, NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import * as React from 'react';

const ApplicantIndex: NextPage = () => (
  <>
    <MainIngress />
    <DraftApplicationsList />
    <SubmittedApplicationsList />
  </>
);

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale || '', ['common'])),
  },
});

export default ApplicantIndex;
