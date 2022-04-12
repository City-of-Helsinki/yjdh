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
  zoom?: number;
  zoomToPosition?: boolean;
  showLink?: boolean;
};

const Map: React.FC<Props> = ({
  postings,
  center,
  height,
  zoom,
  zoomToPosition,
  showLink,
}) => {
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

  const centerPosition =
    postings.length === 1 && zoomToPosition
      ? [
          postings[0].location.position.coordinates[1],
          postings[0].location.position.coordinates[0],
        ]
      : center;

  return (
    <$MapWrapper>
      <MapContainer
        center={centerPosition}
        zoom={zoom}
        style={{ height: height }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {postings.map((posting) => (
          <Marker
            position={[
              posting.location.position.coordinates[1],
              posting.location.position.coordinates[0],
            ]}
          >
            <Popup>
              <$Subtitle>{t(`common:map.helsinkiCity`)}</$Subtitle>
              <$Title>{posting.org_name}</$Title>
              <$Subtitle>{posting.title}</$Subtitle>
              <$Date>{getDateString(posting)}</$Date>
              <$Address>{getAddressString(posting)}</$Address>
              {showLink && (
                <Link href={`/postings/show?id=${posting.id}`} size="L">
                  {t(`common:map.readMore`)}
                </Link>
              )}
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
  zoom: 11,
  zoomToPosition: false,
  showLink: false,
};

export default Map;
