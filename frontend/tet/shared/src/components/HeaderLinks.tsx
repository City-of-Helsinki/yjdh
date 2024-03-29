import Head from 'next/head';
import React from 'react';

const HeaderLinks: React.FC = () => (
  <Head>
    <link
      rel="stylesheet"
      href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"
      // eslint-disable-next-line no-secrets/no-secrets
      integrity="sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A=="
      crossOrigin=""
    />
    <link
      rel="stylesheet"
      href="https://unpkg.com/react-leaflet-markercluster/dist/styles.min.css"
    />
  </Head>
);

export default HeaderLinks;
