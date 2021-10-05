import { GetStaticProps, NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import * as React from 'react';

import FrontPageProvider from '../context/FrontPageProvider';

const ApplicantIndex: NextPage = () => (
  <FrontPageProvider>Hanlder frontpage</FrontPageProvider>
);

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale || '', ['common'])),
  },
});

export default ApplicantIndex;
