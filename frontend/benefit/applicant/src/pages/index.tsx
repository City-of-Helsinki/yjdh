import { GetStaticProps,NextPage  } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import * as React from 'react';
import Container from 'shared/components/container/Container';
import theme from 'shared/styles/theme';

import MainIngress from '../components/mainIngress/MainIngress';

const ApplicantIndex: NextPage = () => (
  <>
    <Container backgroundColor={theme.colors.silverLight}>
      <MainIngress />
    </Container>
  </>
);

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale || '', ['common'])),
  },
});

export default ApplicantIndex;
