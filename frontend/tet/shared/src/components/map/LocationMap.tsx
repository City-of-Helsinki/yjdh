// eslint-disable-next-line import/no-extraneous-dependencies
import { LatLngExpression } from 'leaflet';
import React from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { MapContainer, Marker, TileLayer } from 'react-leaflet';
// eslint-disable-next-line import/no-extraneous-dependencies
import { $MapWrapper } from 'tet-shared/components/map/Map.sc';
import TetPosting from 'tet-shared/types/tetposting';

import { Icon } from './MapIcon';

type Props = {
  posting: TetPosting;
  height?: string;
  zoom?: number;
};

const LocationMap: React.FC<Props> = ({ posting, height, zoom }) => {
  const position: LatLngExpression = [
    posting.location.position.coordinates[1],
    posting.location.position.coordinates[0],
  ];

  return (
    <$MapWrapper>
      <MapContainer center={position} zoom={zoom} style={{ height }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tiles.hel.ninja/styles/hel-osm-bright/{z}/{x}/{y}{r}.png"
        />
        <Marker position={position} icon={Icon} />
      </MapContainer>
    </$MapWrapper>
  );
};

LocationMap.defaultProps = {
  height: '400px',
  zoom: 11,
};

export default LocationMap;
