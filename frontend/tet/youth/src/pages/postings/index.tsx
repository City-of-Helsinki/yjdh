import type { NextPage } from 'next';
import React from 'react';
import { GetStaticProps } from 'next';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';

const ShowStaticPostingPage: NextPage = () => {
  return <div>show posting</div>;
};

export const getStaticProps: GetStaticProps = getServerSideTranslations('common');

export default ShowStaticPostingPage;
