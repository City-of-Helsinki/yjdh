import React from 'react';
import { GetStaticProps, GetStaticPaths, NextPage } from 'next';
import { useRouter } from 'next/router';
import EventPage from 'tet/youth/components/EventPage';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';

const ViewPostingPage: NextPage = () => {
  const router = useRouter();

  const id = router.query.id as string;

  return <EventPage id={id} />;
};

export async function getStaticPaths(): Promise<{ paths: never[]; fallback: boolean }> {
  return {
    // TODO get all TET event id's as paths?
    paths: [],
    fallback: true,
  };
}

export const getStaticProps: GetStaticProps = getServerSideTranslations('common');

export default ViewPostingPage;
