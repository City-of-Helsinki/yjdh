import type { NextPage } from 'next';
import React from 'react';
import EventList from 'tet/youth/components/eventList/EventList';
import { GetStaticProps } from 'next';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';
import { useRouter } from 'next/router';
import EventDataPage from 'tet/youth/eventDataPage/EventDataPage';

const PostingPage: NextPage = () => {
  const router = useRouter();

  const id = router.query.id as string;

  return (
    <>
      <div>
        Placeholder TET-paikalle {id} (toitaiseksi näytetään tapahtuman raakadata mutta näytä sharedista tapahtumasivu)
      </div>
      <EventDataPage id={id} />
    </>
  );
};

export const getStaticProps: GetStaticProps = getServerSideTranslations('common');

export default PostingPage;
