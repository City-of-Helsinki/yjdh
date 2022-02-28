import React from 'react';
import { useQuery } from 'react-query';
import { BackendEndpoint } from 'tet/youth/backend-api/backend-api';
import PageLoadingSpinner from 'shared/components/pages/PageLoadingSpinner';
import { IdObject, Keyword, LinkedEventsPagedResponse, LocalizedObject, Place, TetEvent } from 'tet/youth/linkedevents';

const getLocalizedString = (obj: LocalizedObject): string => obj.fi;

const getIdFromUrl = (idObject: IdObject) => {
  const prefix = '/place/';
  const url = idObject['@id'];
  return url.substring(url.indexOf(prefix) + prefix.length);
};

type Props = {
  idObject: IdObject;
};

const PlaceView: React.FC<Props> = ({ idObject }) => {
  const { isLoading, data, error } = useQuery<Place>(BackendEndpoint.PLACE + getIdFromUrl(idObject));

  if (isLoading) {
    return <PageLoadingSpinner />;
  }

  if (error) {
    return <div>Virhe datan latauksessa</div>;
  }

  if (!data) {
    return <div>Ei löytynyt</div>;
  }

  return (
    <div>
      <p>Nimi: {getLocalizedString(data.name)}</p>
      <p>Katuosoite: {getLocalizedString(data.street_address)}</p>
      <p>Postinumero: {data.postal_code}</p>
      <p>Kaupunki: {getLocalizedString(data.address_locality)}</p>
      {data.position?.coordinates?.length && <p>Koordinaatit: {data.position.coordinates.join(',')}</p>}
    </div>
  );
};

export default PlaceView;
