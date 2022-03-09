import type { NextPage } from 'next';
import React from 'react';
import JobPostings from 'tet/youth/components/jobPostings/JobPostings';
import { GetStaticProps } from 'next';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';

const Postings: NextPage = () => {
  return <JobPostings />;
};

export const getStaticProps: GetStaticProps = getServerSideTranslations('common');

export default Postings;
