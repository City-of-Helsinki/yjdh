import { GetStaticProps, NextPage } from 'next';
import { useTranslation } from 'next-i18next';
import React from 'react';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';

const YouthIndex: NextPage = () => {
  const { t } = useTranslation();
  return <p>Hello, {t('common:appName')}!</p>;
};

export const getStaticProps: GetStaticProps =
  getServerSideTranslations('common');

export default YouthIndex;
