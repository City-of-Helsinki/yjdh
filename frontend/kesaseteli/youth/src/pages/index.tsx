import ApplicationNotOpen from 'kesaseteli/youth/components/ApplicationNotOpen';
import YouthApplication from 'kesaseteli/youth/components/youth-form/YouthApplication';
import useSummerVoucherConfigurationQuery from 'kesaseteli/youth/hooks/backend/useSummerVoucherConfigurationQuery';
import { GetStaticProps, NextPage } from 'next';
import React from 'react';
import PageLoadingSpinner from 'shared/components/pages/PageLoadingSpinner';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';

const YouthIndex: NextPage = () => {
  const { data: configuration, isLoading } = useSummerVoucherConfigurationQuery();

  if (isLoading) {
    return <PageLoadingSpinner />;
  }

  const currentYear = new Date().getFullYear();
  const hasCurrentYearConfiguration = configuration?.some(
    (c) => c.year === currentYear
  );

  if (!hasCurrentYearConfiguration) {
    return <ApplicationNotOpen />;
  }

  return <YouthApplication />;
};

export const getStaticProps: GetStaticProps =
  getServerSideTranslations('common');

export default YouthIndex;
