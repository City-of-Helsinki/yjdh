import { Metadata } from 'next';
import React from 'react';
import NotificationPage from 'shared/components/pages/NotificationPage';

import { getCommonTranslations } from '../../../lib/i18n-server';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = (await getCommonTranslations(locale)) as any;
  return {
    title: `${t.notificationPages.activated.title} | ${t.appName}`,
  };
}

export default async function ActivatedPage({ params }: Props): Promise<React.ReactElement> {
  const { locale } = await params;
  const t = (await getCommonTranslations(locale)) as any;
  return (
    <NotificationPage
      type="success"
      title={t.notificationPages.activated.title}
      message={t.notificationPages.activated.message}
    />
  );
}
