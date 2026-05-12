import SecondInstalmentUploadPage from 'benefit/applicant/components/applications/secondInstalmentUpload/SecondInstalmentUploadPage';
import { GetStaticProps, NextPage } from 'next';
import React from 'react';
import withAuth from 'shared/components/hocs/withAuth';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';

const SecondInstalmentUpload: NextPage = () => <SecondInstalmentUploadPage />;

export const getStaticProps: GetStaticProps =
  getServerSideTranslations('common');

export default withAuth(SecondInstalmentUpload);
