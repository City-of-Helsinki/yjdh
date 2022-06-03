import type { NextPage } from 'next';
import React from 'react';
import JobPostings from 'tet/youth/components/jobPostings/JobPostings';
import { GetStaticProps } from 'next';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';
import HeaderLinks from 'tet-shared/components/HeaderLinks';
import MapScripts from 'tet-shared/components/MapScripts';
import Script from 'next/script';

const Postings: NextPage = () => {
  return (
    <>
      <HeaderLinks />
      <JobPostings />
      <MapScripts />
      <Script
        src="https://unpkg.com/react-leaflet-markercluster/src/react-leaflet-markercluster.js"
        strategy="beforeInteractive"
      />
    </>
  );
};

export const getStaticProps: GetStaticProps = getServerSideTranslations('common');

export default Postings;
