import { GetStaticProps, NextPage } from 'next';
import React from 'react';
import PageNotFound from 'shared/components/pages/PageNotFound';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';

const FourOhFour: NextPage = () => <PageNotFound />;

export const getStaticProps: GetStaticProps = getServerSideTranslations('common');

export default FourOhFour;
