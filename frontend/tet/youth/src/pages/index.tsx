import type { NextPage } from 'next';
import React from 'react';
import EventList from 'tet/youth/components/eventList/EventList';
import { GetStaticProps } from 'next';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';

const Home: NextPage = () => <EventList />;

export const getStaticProps: GetStaticProps = getServerSideTranslations('common');

export default Home;
