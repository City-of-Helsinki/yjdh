import type { NextPage } from 'next';
import React from 'react';
import { GetStaticProps } from 'next';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';
import Banner from 'tet/youth/components/banner/Banner';
import QuickSearch from 'tet/youth/components/quickSearch/QuickSearch';

const Home: NextPage = () => {
  return (
    <>
      <Banner />
      <QuickSearch />
    </>
  );
};

export const getStaticProps: GetStaticProps = getServerSideTranslations('common');

export default Home;
