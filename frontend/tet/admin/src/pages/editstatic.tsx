import { GetStaticProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { useQuery } from 'react-query';
import withAuth from 'shared/components/hocs/withAuth';
import PageLoadingSpinner from 'shared/components/pages/PageLoadingSpinner';
import PageNotFound from 'shared/components/pages/PageNotFound';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';
import { BackendEndpoint } from 'tet/admin/backend-api/backend-api';
import EditById from 'tet/admin/components/editor/EditById';
import EditorLoadingError from 'tet/admin/components/editor/EditorLoadingError';
import HeaderLinks from 'tet-shared/components/HeaderLinks';
import useEventPostingTransformation from 'tet-shared/hooks/backend/useEventPostingTransformation';
import { TetEvent } from 'tet-shared/types/linkedevents';

const EditStaticPage: NextPage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { eventToTetPosting, keywordResult } = useEventPostingTransformation();
  const id = router.query.id as string;
  const { isLoading, data, error } = useQuery<TetEvent>(`${BackendEndpoint.TET_POSTINGS}${id}`, {
    enabled: router.isReady,
  });

  if (isLoading || keywordResult.isLoading) {
    return <PageLoadingSpinner />;
  }

  if (error || keywordResult.error) {
    const err = (error as Error) || keywordResult.error;
    return <EditorLoadingError error={err} />;
  }

  if (data) {
    const posting = eventToTetPosting(data);
    return (
      <>
        <HeaderLinks />
        <EditById title={t('common:editor.editTitle')} data={posting} />
      </>
    );
  }
  return <PageNotFound />;
};

export const getStaticProps: GetStaticProps = getServerSideTranslations('common');

export default withAuth(EditStaticPage);
