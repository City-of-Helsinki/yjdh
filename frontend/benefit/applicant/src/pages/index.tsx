import { NextPage } from 'next';
import * as React from 'react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticProps } from 'next';

import theme from 'shared/styles/theme';

import Container from 'shared/components/container/Container';
import MainIngress from '../components/mainIngress/MainIngress';

const ApplicantIndex: NextPage = () => (
  <React.Fragment>
    <Container backgroundColor={theme.colors.primaryGray}>
      <MainIngress />
    </Container>
  </React.Fragment>
);

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale || '', ['common'])),
  },
});

export default ApplicantIndex;
