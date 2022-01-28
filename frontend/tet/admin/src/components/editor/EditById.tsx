import * as React from 'react';

import { useQuery } from 'react-query';
import { BackendEndpoint } from 'tet/admin/backend-api/backend-api';
import PageLoadingSpinner from 'shared/components/pages/PageLoadingSpinner';
import { TetPostings } from 'tet/admin/types/tetposting';
import Editor from 'tet/admin/components/editor/Editor';

type EditByIdProps = {
  id: string;
};

const EditById: React.FC<EditByIdProps> = ({ id }) => {
  const { isLoading, data } = useQuery<TetPostings>(BackendEndpoint.TET_POSTINGS);

  if (isLoading) {
    return <PageLoadingSpinner />;
  }

  const posting = data && [...data.draft, ...data.published].find((p) => p.id === id);

  return posting ? <Editor initialValue={posting} /> : <>Not found.</>;
};

export default EditById;
