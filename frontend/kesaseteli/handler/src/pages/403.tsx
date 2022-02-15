import { GetStaticProps, NextPage } from 'next';
import React from 'react';
import ForbiddenPage from 'shared/components/pages/ForbiddenPage';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';

const FourOhThree: NextPage = () => <ForbiddenPage />;

export const getStaticProps: GetStaticProps =
  getServerSideTranslations('common');

export default FourOhThree;
