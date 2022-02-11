import React from 'react';
import { useQuery } from 'react-query';
import { BackendEndpoint } from 'tet/youth/backend-api/backend-api';
import PageLoadingSpinner from 'shared/components/pages/PageLoadingSpinner';
import { LinkedEventsPagedResponse, LocalizedObject, TetEvent } from 'tet/youth/linkedevents';
import { useRouter } from 'next/router';
import Keywords from 'tet/youth/components/Keywords';

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

  return (
    <div>
      <h1>Tet-paikka (testistä)</h1>
      <p>Tehtävänimike: {getLocalizedString(data.name)}</p>
      <p>Lyhyt kuvaus: {getLocalizedString(data.short_description)}</p>
      <p>Kuvaus: {getLocalizedString(data.description)}</p>
      {data.keywords.map((k, i) => (
        <Keywords key={i} keyword={k} />
      ))}
    </div>
  );
};

export default EventPage;
