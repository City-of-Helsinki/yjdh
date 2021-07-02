// import ApplicationsList from 'benefit/applicant/components/applications/applicationList/ApplicationList';
import MainIngress from 'benefit/applicant/components/mainIngress/MainIngress';
import { GetStaticProps, NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import * as React from 'react';

const EditApplicationIndex: NextPage = () => (
  <>
    <MainIngress />
    {/* <ApplicationsList data={[]} /> */}
  </>
);

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale || '', ['common'])),
  },
});

export default EditApplicationIndex;
