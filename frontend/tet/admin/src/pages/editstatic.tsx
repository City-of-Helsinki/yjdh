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
import Head from 'next/head';

const EditStaticPage: NextPage = () => {
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

  //TODO Change to use HeaderLinks
  if (data) {
    const posting = eventToTetPosting(data);
    return (
      <>
        <Head>
          <link
            rel="stylesheet"
            href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"
            integrity="sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A=="
            crossorigin=""
          />
          <script
            src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"
            integrity="sha512-XQoYMqMTK8LvdxXYG3nZ448hOEQiglfqkJs1NOQV44cWnUrBc8PkAOcXy20w0vlaXaVUearIOBhiXZ5V3ynxwA=="
            crossorigin=""
          ></script>
        </Head>
        <EditById title={t('common:editor.editTitle')} data={posting} />;
      </>
    );
  } else {
    return <PageNotFound />;
  }
};

export const getStaticProps: GetStaticProps = getServerSideTranslations('common');

export default withAuth(EditStaticPage);
