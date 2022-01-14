import { Button } from 'hds-react';
import * as React from 'react';
import Container from 'shared/components/container/Container';
import { useTranslation } from 'next-i18next';

import { useQuery } from 'react-query';
import { BackendEndpoint } from 'tet/admin/backend-api/backend-api';
import PageLoadingSpinner from 'shared/components/pages/PageLoadingSpinner';
import { useRouter } from 'next/router';
import TetPosting from 'tet/admin/types/tetposting';
import Editor from 'tet/admin/components/editor/Editor';

type EditByIdProps = {
  id: string;
};

const EditById: React.FC<EditByIdProps> = ({ id }) => {
  const { t } = useTranslation();
  const { isLoading, data } = useQuery<TetPosting[]>(BackendEndpoint.TET_POSTINGS);
  const router = useRouter();

  if (isLoading) {
    return <PageLoadingSpinner />;
  }

  const posting = data?.find((p) => p.id === id);

  return posting ? <Editor initialValue={posting} /> : <>Not found.</>;
};

export default EditById;
