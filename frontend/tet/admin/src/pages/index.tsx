import React from 'react';
import { GetStaticProps, NextPage } from 'next';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';
import JobPostings from 'tet/admin/components/jobPostings/JobPostings';

const Index: NextPage = () => {
  console.log('Rendering application');

  return <JobPostings />;
};

export const getStaticProps: GetStaticProps = getServerSideTranslations('common');

export default Index;
