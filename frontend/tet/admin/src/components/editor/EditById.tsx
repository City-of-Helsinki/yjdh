import * as React from 'react';

import { useQuery } from 'react-query';
import { BackendEndpoint } from 'tet/admin/backend-api/backend-api';
import PageLoadingSpinner from 'shared/components/pages/PageLoadingSpinner';
import { TetPostings } from 'tet/admin/types/tetposting';
import Editor from 'tet/admin/components/editor/Editor';
import { TetEvent } from 'tet/admin/types/linkedevents';
import { eventToTetPosting } from 'tet/admin/backend-api/transformations';

type EditByIdProps = {
  id: string;
};

const EditById: React.FC<EditByIdProps> = ({ id }) => {
  const { isLoading, data } = useQuery<TetEvent>(`${BackendEndpoint.TET_POSTINGS}${id}`);

  if (isLoading) {
    return <PageLoadingSpinner />;
  }

  return data ? <Editor initialValue={eventToTetPosting(data)} /> : <>Not found.</>;
};

export default EditById;
