import React from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import TetPosting from 'tet-shared/types/tetposting';

type Props = {
  postings: TetPosting[];
  center?: number[];
  height?: string;
};

const Map: React.FC<Props> = ({ postings, center }) => {
  return (
    <MapContainer
      center={center}
      zoom={10}
      style={{ height: '400px' }}
      boundsOptions
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {postings.map((posting) => (
        <Marker position={posting.location.position.coordinates.reverse()}>
          <Popup>
            <$Title>{posting.org_name}</$Title>
            <$Subtitle>{posting.title}</$Subtitle>
            <$Date>{date}</$Date>
            <$Address>{address}</$Address>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

Map.defaultProps = {
  center: [60.1699, 24.9384], //Helsinki location
  height: '400px',
};

export default Map;
