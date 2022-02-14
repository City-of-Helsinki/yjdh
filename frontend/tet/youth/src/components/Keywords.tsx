import React from 'react';
import { useQuery } from 'react-query';
import { BackendEndpoint } from 'tet/youth/backend-api/backend-api';
import PageLoadingSpinner from 'shared/components/pages/PageLoadingSpinner';
import { IdObject, Keyword, LocalizedObject } from 'tet/youth/linkedevents';

const getLocalizedString = (obj: LocalizedObject): string => obj.fi;

const getIdFromUrl = (keyword: IdObject) => {
  const prefix = '/keyword/';
  const url = keyword['@id'];
  return url.substring(url.indexOf(prefix) + prefix.length);
};

const keywordType = (id: string) => {
  if (id.startsWith('helmet')) return 'Työtapa';
  if (id.startsWith('kulke')) return 'Työn ominaisuus';
  if (id.startsWith('yso')) return 'Avainsana';

  return 'TUNTEMATON LUOKITTELU';
};

type Props = {
  keyword: IdObject;
};

const Keywords: React.FC<Props> = ({ keyword }) => {
  const { isLoading, data, error } = useQuery<Keyword>(BackendEndpoint.KEYWORD + getIdFromUrl(keyword));

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
      {getLocalizedString(data.name)} ({keywordType(getIdFromUrl(keyword))})
    </div>
  );
};

export default Keywords;
