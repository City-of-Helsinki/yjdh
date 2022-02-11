import React from 'react';
import { GetStaticProps, GetStaticPaths, NextPage } from 'next';
// import getServerSideTranslations from 'shared/i18n/get-server-side-translations';
// import Container from 'shared/components/container/Container';
// import { $Heading, $HeadingContainer } from 'tet/admin/components/jobPostings/JobPostings.sc';
// import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import EventPage from 'tet/youth/components/EventPage';

// TODO This page loads well when navigated to from the app
// but exception from BaseApp i18n is thrown when opened directly (reloading)
const ViewPostingPage: NextPage = () => {
  const router = useRouter();

  const id = router.query.id as string;

  return <EventPage id={id} />;
};

// export async function getStaticPaths(): Promise<{ paths: never[]; fallback: boolean }> {
//   return {
//     paths: [],
//     fallback: true,
//   };
// }

export default ViewPostingPage;
