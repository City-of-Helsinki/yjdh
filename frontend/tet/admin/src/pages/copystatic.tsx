import React from 'react';
import { GetStaticProps, NextPage } from 'next';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import EditById from 'tet/admin/components/editor/EditById';
import { BackendEndpoint } from 'tet/admin/backend-api/backend-api';
import { TetEvent } from 'tet-shared/types/linkedevents';
import PageLoadingSpinner from 'shared/components/pages/PageLoadingSpinner';
import { eventToTetPosting } from 'tet-shared/backend-api/transformations';
import useKeywordType from 'tet-shared/hooks/backend/useKeywordType';
import { useQuery } from 'react-query';
import PageNotFound from 'shared/components/pages/PageNotFound';
import withAuth from 'shared/components/hocs/withAuth';
import useLanguageOptions from 'tet-shared/hooks/translation/useLanguageOptions';
import EditorLoadingError from 'tet/admin/components/editor/EditorLoadingError';

const CopyStaticPage: NextPage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const id = router.query.id as string;
  const { isLoading, data, error } = useQuery<TetEvent>(`${BackendEndpoint.TET_POSTINGS}${id}`);

  const keywordResult = useKeywordType();
  const languageOptions = useLanguageOptions();

  if (isLoading || keywordResult.isLoading) {
    return <PageLoadingSpinner />;
  }

  if (error || keywordResult.error) {
    const err = (error as Error) || keywordResult.error;
    return <EditorLoadingError error={err} />;
  }

  if (data) {
    const posting = eventToTetPosting(data, keywordResult.getKeywordType, languageOptions);
    delete posting.id;
    return <EditById title={t('common:editor.copyTitle')} data={posting} />;
  } else {
    return <PageNotFound />;
  }
};

export const getStaticProps: GetStaticProps = getServerSideTranslations('common');

export default withAuth(CopyStaticPage);
