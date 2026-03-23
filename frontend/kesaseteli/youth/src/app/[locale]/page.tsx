'use client';

import ApplicationNotOpen from 'kesaseteli/youth/components/ApplicationNotOpen';
import YouthApplication from 'kesaseteli/youth/components/youth-form/YouthApplication';
import useSummerVoucherConfigurationQuery from 'kesaseteli/youth/hooks/backend/useSummerVoucherConfigurationQuery';
import { NextPage } from 'next';
import React from 'react';
import PageLoadingSpinner from 'shared/components/pages/PageLoadingSpinner';

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

export default YouthIndex;
