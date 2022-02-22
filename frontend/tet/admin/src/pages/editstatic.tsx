import React from 'react';
import { GetStaticProps, GetStaticPaths, NextPage } from 'next';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import EditById from 'tet/admin/components/editor/EditById';
import { BackendEndpoint } from 'tet/admin/backend-api/backend-api';
import { TetEvent } from 'tet/admin/types/linkedevents';
import PageLoadingSpinner from 'shared/components/pages/PageLoadingSpinner';
import { eventToTetPosting } from 'tet/admin/backend-api/transformations';
import { useQuery } from 'react-query';
import BackButton from 'tet/admin/components/BackButton';
import Container from 'shared/components/container/Container';
import PageNotFound from 'shared/components/pages/PageNotFound';

const EditStaticPage: NextPage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const id = router.query.id as string;
  const { isLoading, data } = useQuery<TetEvent>(`${BackendEndpoint.TET_POSTINGS}${id}`);

  if (isLoading) {
    return <PageLoadingSpinner />;
  }

  let content;

  if (data) {
    content = <EditById title={t('common:editor.copyTitle')} data={{ ...eventToTetPosting(data), id: null }} />;
  } else {
    content = <PageNotFound />;
  }

  return (
    <>
      <Container>
        <BackButton />
        {content}
      </Container>
    </>
  );
};

export const getStaticProps: GetStaticProps = getServerSideTranslations('common');

export default EditStaticPage;
