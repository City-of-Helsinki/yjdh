import type { NextPage } from 'next';
import React from 'react';
import { GetStaticProps } from 'next';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';
import Banner from 'tet/youth/components/banner/Banner';
import QuickSearch from 'tet/youth/components/quickSearch/QuickSearch';
import PageContent from 'tet/youth/components/pageContent/PageContent';
import LinkSection from 'tet/youth/components/linkSection/LinkSection';

const Home: NextPage = () => {
  return (
    <>
      <Banner />
      <QuickSearch />
      <PageContent />
      <LinkSection />
    </>
  );
};

export const getStaticProps: GetStaticProps = getServerSideTranslations('common');

export default Home;
