import { GetStaticProps, NextPage } from 'next';
import React from 'react';
import ServerErrorPage from 'shared/components/pages/ServerErrorPage';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';

const FiveHundred: NextPage = () => <ServerErrorPage />;

export const getStaticProps: GetStaticProps =
  getServerSideTranslations('common');

export default FiveHundred;
