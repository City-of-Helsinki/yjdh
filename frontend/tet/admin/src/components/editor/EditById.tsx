import * as React from 'react';

import { useQuery } from 'react-query';
import { BackendEndpoint } from 'tet/admin/backend-api/backend-api';
import PageLoadingSpinner from 'shared/components/pages/PageLoadingSpinner';
import { TetPostings } from 'tet/admin/types/tetposting';
import Editor from 'tet/admin/components/editor/Editor';
import { TetEvent } from 'tet/admin/types/linkedevents';
import { eventToTetPosting } from 'tet/admin/backend-api/transformations';
import useKeywordType from 'tet/admin/hooks/backend/useKeywordType';

type EditByIdProps = {
  id: string;
};

const EditById: React.FC<EditByIdProps> = ({ id }) => {
  const { isLoading, data } = useQuery<TetEvent>(`${BackendEndpoint.TET_POSTINGS}${id}`);
  const keywordResult = useKeywordType();

  if (isLoading || keywordResult.isLoading) {
    return <PageLoadingSpinner />;
  }

  return data ? <Editor initialValue={eventToTetPosting(data, keywordResult.getKeywordType)} /> : <>Not found.</>;
};

export default EditById;
