import { GetStaticProps, NextPage } from 'next';
import React from 'react';
import Container from 'shared/components/container/Container';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';

const TermsOfService: NextPage = () => {
  return <Container>Testing</Container>;
};

export const getStaticProps: GetStaticProps =
  getServerSideTranslations('common');

export default TermsOfService;
