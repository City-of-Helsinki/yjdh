import type { NextPage } from 'next';
import React from 'react';
import { GetStaticProps } from 'next';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';
import Postings from 'tet/youth/components/postings/Postings';

const PostingSearch: NextPage = () => <Postings />;

export const getStaticProps: GetStaticProps = getServerSideTranslations('common');

export default PostingSearch;
