import React from 'react';
import { GetStaticProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import EventDataPage from 'tet/youth/eventDataPage/EventDataPage';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';

const ViewPostingPage: NextPage = () => {
  const router = useRouter();

  const id = router.query.id as string;

  return <EventDataPage id={id} />;
};

// TODO for some reason next-i18n doesn't get set for a dynamic route

// export async function getStaticPaths(): Promise<{ paths: never[]; fallback: boolean }> {
//   return {
//     // TODO get all TET event id's as paths?
//     paths: [],
//     fallback: true,
//   };
// }
//
// export const getStaticProps: GetStaticProps = getServerSideTranslations('common');

export default ViewPostingPage;
