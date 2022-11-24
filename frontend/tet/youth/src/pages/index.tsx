import type { NextPage } from 'next';
import { GetStaticProps } from 'next';
import React from 'react';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';
import Banner from 'tet/youth/components/banner/Banner';
import LinkSection from 'tet/youth/components/linkSection/LinkSection';
import PageContent from 'tet/youth/components/pageContent/PageContent';
import QuickSearch from 'tet/youth/components/quickSearch/QuickSearch';

const Home: NextPage = () => (
  <>
    <Banner />
    <QuickSearch />
    <PageContent />
    <LinkSection />
  </>
);

export const getStaticProps: GetStaticProps = getServerSideTranslations('common');

export default Home;
