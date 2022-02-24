import type { NextPage } from 'next';
import React from 'react';
import EventList from 'tet/youth/components/eventList/EventList';
import { GetStaticProps } from 'next';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';
import Container from 'shared/components/container/Container';

const Postings: NextPage = () => {
  return (
    <Container>
      <EventList />
    </Container>
  );
};

export const getStaticProps: GetStaticProps = getServerSideTranslations('common');

export default Postings;
