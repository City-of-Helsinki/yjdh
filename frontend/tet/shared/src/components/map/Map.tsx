import React from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import TetPosting from 'tet-shared/types/tetposting';
import { useTranslation } from 'next-i18next';
import {
  $MapWrapper,
  $Title,
  $Subtitle,
  $Date,
  $Address,
} from 'tet-shared/components/map/Map.sc';
import { Link } from 'hds-react';

type Props = {
  postings: TetPosting[];
  center?: number[];
  height?: string;
};

const Map: React.FC<Props> = ({ postings, center, height }) => {
  const { t } = useTranslation();
  const getDateString = (posting: TetPosting): string =>
    `${posting.start_date} - ${posting.end_date ?? ''}`;

  const getAddressString = (posting: TetPosting): string => {
    const street_address = posting.location.street_address
      ? `, ${posting.location.street_address}`
      : '';
    const postal_code = posting.location.postal_code
      ? `, ${posting.location.postal_code}`
      : '';
    const city = posting.location.city ? `, ${posting.location.city}` : '';
    return posting.location.name + street_address + postal_code + city;
  };

  return (
    <$MapWrapper>
      <MapContainer center={center} zoom={10} style={{ height: height }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {postings.map((posting) => (
          <Marker position={posting.location.position.coordinates.reverse()}>
            <Popup>
              <$Title>{posting.org_name}</$Title>
              <$Subtitle>{posting.title}</$Subtitle>
              <$Date>{getDateString(posting)}</$Date>
              <$Address>{getAddressString(posting)}</$Address>
              <Link href="https://hel.fi" size="L">
                Lue lisää
              </Link>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </$MapWrapper>
  );
};

Map.defaultProps = {
  center: [60.1699, 24.9384], //Helsinki location
  height: '400px',
};

export default Map;
