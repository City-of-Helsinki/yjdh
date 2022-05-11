import Script from 'next/script';
import React from 'react';

const MapScripts = (): JSX.Element => (
  <Script
    src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"
    // eslint-disable-next-line no-secrets/no-secrets
    integrity="sha512-XQoYMqMTK8LvdxXYG3nZ448hOEQiglfqkJs1NOQV44cWnUrBc8PkAOcXy20w0vlaXaVUearIOBhiXZ5V3ynxwA=="
    crossOrigin=""
    strategy="beforeInteractive"
  />
);

export default MapScripts;
