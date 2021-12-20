import React from 'react';
import Container from 'shared/components/container/Container';
import { GetStaticProps, NextPage } from 'next';
import { useTheme } from 'styled-components';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';
import JobPostings from 'tet/admin/components/jobPostings/JobPostings';

const Application: NextPage = () => {
  console.log('Rendering application');

  // const theme = useTheme();

  return <JobPostings />;
};

export const getStaticProps: GetStaticProps = getServerSideTranslations('common');

export default Application;
