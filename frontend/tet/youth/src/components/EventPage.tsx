import React from 'react';
import { useQuery } from 'react-query';
import { BackendEndpoint } from 'tet/youth/backend-api/backend-api';
import PageLoadingSpinner from 'shared/components/pages/PageLoadingSpinner';
import { CustomData, LocalizedObject, TetEvent } from 'tet/youth/linkedevents';
import { useRouter } from 'next/router';
import Keywords from 'tet/youth/components/Keywords';
import PlaceView from 'tet/youth/components/PlaceView';

const getLocalizedString = (obj: LocalizedObject): string => obj.fi;

type Props = {
  id: string;
};

const EventPage: React.FC<Props> = ({ id }) => {
  const { isLoading, data, error } = useQuery<TetEvent>(BackendEndpoint.EVENT + id);
  const router = useRouter();

  if (isLoading) {
    return <PageLoadingSpinner />;
  }

  if (error) {
    return <div>Virhe datan latauksessa</div>;
  }

  console.log(data);

  if (!data) {
    return <div>Ei löytynyt</div>;
  }

  const fromCustomData = (key: keyof CustomData): string =>
    data.custom_data ? data.custom_data[key] : '[tapahtumalla tyhjä custom_data]';

  return (
    <div>
      <h1>Tet-paikka (testistä)</h1>
      <p>Työpaikka: {fromCustomData('org_name')}</p>
      <p>Tehtävänimike: {getLocalizedString(data.name)}</p>
      <p>Lyhyt kuvaus: {getLocalizedString(data.short_description)}</p>
      <p>Kuvaus: {getLocalizedString(data.description)}</p>
      <p>Harjoittelupaikkoja: {fromCustomData('spots')}</p>
      <h3>Luokittelut</h3>
      {data.keywords.map((k) => (
        <Keywords key={k['@id']} keyword={k} />
      ))}
      <h3>Päivämäärä ja aika</h3>
      <p>Alkaa: {data.start_time}</p>
      <p>Päättyy: {data.end_time}</p>
      <h3>Paikka</h3>
      <PlaceView idObject={data.location} />
      <h3>Muut tiedot</h3>
      <p>Puhelinnumero: {fromCustomData('contact_phone')}</p>
      <p>
        Yhteyshenkilö: {fromCustomData('contact_first_name')} {fromCustomData('contact_last_name')}
      </p>
      <p>Sähköposti: {fromCustomData('contact_email')}</p>
      <p>Kieli: {fromCustomData('contact_language')}</p>
      <h3>Meta</h3>
      <p>Julkaistu aikaleima: {data.date_published}</p>
      <p>Luotu aikaleima: {data.created_time}</p>
      <p>Muokattu aikaleima: {data.last_modified_time}</p>
      <p>Ilmoituksen tekijän sähköposti: {fromCustomData('editor_email')}</p>
      <p>event_status: {data.event_status}</p>
      <p>publication_status: {data.publication_status}</p>
      <hr />
      <button onClick={() => router.push('/')}>Palaa</button>
    </div>
  );
};

export default EventPage;
