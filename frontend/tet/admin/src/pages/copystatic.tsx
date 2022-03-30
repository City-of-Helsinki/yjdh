import React from 'react';
import { GetStaticProps, NextPage } from 'next';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import EditById from 'tet/admin/components/editor/EditById';
import { BackendEndpoint } from 'tet/admin/backend-api/backend-api';
import { TetEvent } from 'tet-shared/types/linkedevents';
import PageLoadingSpinner from 'shared/components/pages/PageLoadingSpinner';
import { useQuery } from 'react-query';
import PageNotFound from 'shared/components/pages/PageNotFound';
import withAuth from 'shared/components/hocs/withAuth';
import EditorLoadingError from 'tet/admin/components/editor/EditorLoadingError';
import useEventPostingTransformation from 'tet-shared/hooks/backend/useEventPostingTransformation';

const CopyStaticPage: NextPage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { eventToTetPosting, keywordResult } = useEventPostingTransformation();
  const id = router.query.id as string;
  const { isLoading, data, error } = useQuery<TetEvent>(`${BackendEndpoint.TET_POSTINGS}${id}`);

  if (isLoading || keywordResult.isLoading) {
    return <PageLoadingSpinner />;
  }

  if (error || keywordResult.error) {
    const err = (error as Error) || keywordResult.error;
    return <EditorLoadingError error={err} />;
  }

  if (data) {
    const posting = eventToTetPosting(data);
    delete posting.id;
    posting.date_published = null;
    return <EditById title={t('common:editor.copyTitle')} data={posting} allowDelete={false} />;
  } else {
    return <PageNotFound />;
  }
};

export const getStaticProps: GetStaticProps = getServerSideTranslations('common');

export default withAuth(CopyStaticPage);
