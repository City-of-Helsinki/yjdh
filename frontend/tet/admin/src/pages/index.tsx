import React from 'react';
import { GetStaticProps, NextPage } from 'next';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';
import JobPostings from 'tet/admin/components/jobPostings/JobPostings';
import withAuth from 'shared/components/hocs/withAuth';

const Index: NextPage = () => <JobPostings />;

export const getStaticProps: GetStaticProps = getServerSideTranslations('common');

export default withAuth(Index);
