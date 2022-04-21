import Head from 'next/head';
import React from 'react';

const HeaderLinks = (): JSX.Element => (
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
    <script
      src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"
      // eslint-disable-next-line no-secrets/no-secrets
      integrity="sha512-XQoYMqMTK8LvdxXYG3nZ448hOEQiglfqkJs1NOQV44cWnUrBc8PkAOcXy20w0vlaXaVUearIOBhiXZ5V3ynxwA=="
      crossOrigin=""
    />
    <script src="https://unpkg.com/react-leaflet-markercluster/src/react-leaflet-markercluster.js" />
  </Head>
);

export default HeaderLinks;
