import type { NextPage } from 'next';
import { GetStaticProps } from 'next';
import Script from 'next/script';
import React from 'react';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';
import JobPostings from 'tet/youth/components/jobPostings/JobPostings';
import HeaderLinks from 'tet-shared/components/HeaderLinks';
import MapScripts from 'tet-shared/components/MapScripts';

const Postings: NextPage = () => (
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

export const getStaticProps: GetStaticProps = getServerSideTranslations('common');

export default Postings;
