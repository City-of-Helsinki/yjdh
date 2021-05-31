import { GetStaticProps, NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import * as React from 'react';

import DraftApplicationsList from '../components/applications/draftsList/DraftsList';
import SubmittedApplicationsList from '../components/applications/submittedList/SubmittedList';
import MainIngress from '../components/mainIngress/MainIngress';

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
