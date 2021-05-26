import { NextPage } from 'next';
import * as React from 'react';

import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticProps } from 'next';

const ApplicantIndex: NextPage = () => (
  <React.Fragment>Page content</React.Fragment>
);

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale || '', ['common'])),
  },
});

export default ApplicantIndex;
