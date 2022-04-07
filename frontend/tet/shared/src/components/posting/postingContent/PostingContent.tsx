import React from 'react';
import TetPosting from 'tet-shared/types/tetposting';
import Container from 'shared/components/container/Container';
import PostingInfoItem from 'tet-shared//components/posting/postingInfoItem/PostingInfoItem';
import {
  $ContentWrapper,
  $Body,
  $InfoWrapper,
  $Title,
} from 'tet-shared//components/posting/postingContent/PostingContent.sc';
import { IconCalendarClock, IconLocation, IconInfoCircle } from 'hds-react';
import { useTranslation } from 'next-i18next';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';

type Props = {
  posting: TetPosting;
};

const PostingContent: React.FC<Props> = ({ posting }) => {
  const { t } = useTranslation();
  const addressList = [
    posting.location.name,
    posting.location.street_address,
    `${posting.location.postal_code} ${posting.location.city}`,
  ];
  const contact = [posting.contact_phone, posting.contact_email];

  const date = `${posting.start_date} - ${posting.end_date ?? ''}`;
  const languages = posting.languages.map((language) => language.label);
  const position = [51.505, -0.09];

  return (
    <Container>
      <$ContentWrapper>
        <$Body>
          <$Title>{posting.title}</$Title>
          <div>{posting.description}</div>
          <MapContainer center={position} zoom={13} style={{ height: '400px' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={position}>
              <Popup>
                A pretty CSS3 popup. <br /> Easily customizable.
              </Popup>
            </Marker>
          </MapContainer>
        </$Body>
        <$InfoWrapper>
          <PostingInfoItem
            title={t('common:postingTemplate.dateAndTime')}
            body={date}
            icon={<IconCalendarClock />}
          />
          <PostingInfoItem
            title={t('common:postingTemplate.location')}
            body={addressList}
            icon={<IconLocation />}
          />
          <PostingInfoItem
            title={t('common:postingTemplate.contact')}
            body={contact}
            icon={<IconInfoCircle />}
          />
          <PostingInfoItem
            title={t('common:postingTemplate.languages')}
            body={languages}
            icon={<IconInfoCircle />}
          />
        </$InfoWrapper>
      </$ContentWrapper>
    </Container>
  );
};

export default PostingContent;
