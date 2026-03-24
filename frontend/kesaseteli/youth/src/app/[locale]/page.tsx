import ApplicationNotOpen from 'kesaseteli/youth/components/ApplicationNotOpen';
import YouthApplication from 'kesaseteli/youth/components/youth-form/YouthApplication';
import SummerVoucherConfiguration from 'kesaseteli-shared/types/summer-voucher-configuration';
import { Metadata } from 'next';
import React from 'react';

import { getConfiguration } from '../../lib/backend-server';
import { getCommonTranslations } from '../../lib/i18n-server';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = (await getCommonTranslations(locale)) as { appName: string };
  return {
    title: t.appName,
  };
}

export default async function YouthIndex(): Promise<React.ReactElement> {
  const configuration = await getConfiguration();

  const currentYear = new Date().getFullYear();
  const hasCurrentYearConfiguration = configuration?.some(
    (c: SummerVoucherConfiguration) => c.year === currentYear
  );

  if (!hasCurrentYearConfiguration) {
    return <ApplicationNotOpen />;
  }

  return <YouthApplication />;
}
