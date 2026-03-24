import { Metadata } from 'next';
import React from 'react';
import NotificationPage from 'shared/components/pages/NotificationPage';

import { getCommonTranslations } from '../../../lib/i18n-server';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = (await getCommonTranslations(locale));
  return {
    title: `${t.notificationPages.alreadyAssigned.title} | ${t.appName}`,
  };
}

export default async function AlreadyAssignedPage({ params }: Props): Promise<React.ReactElement> {
  const { locale } = await params;
  const t = (await getCommonTranslations(locale));
  return (
    <NotificationPage
      type="error"
      title={t.notificationPages.alreadyAssigned.title}
      goToFrontPageText={t.notificationPages.alreadyAssigned.goToFrontendPage}
    />
  );
}
