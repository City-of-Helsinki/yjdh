import { Metadata } from 'next';
import React from 'react';
import NotificationPage from 'shared/components/pages/NotificationPage';
import getActivationLinkExpirationSeconds from '../../../utils/get-activation-link-expiration-seconds';
import { getCommonTranslations } from '../../../lib/i18n-server';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = (await getCommonTranslations(locale)) as any;
  return {
    title: `${t.notificationPages.expired.title} | ${t.appName}`,
  };
}

export default async function ExpiredPage({ params }: Props): Promise<React.ReactElement> {
  const { locale } = await params;
  const t = (await getCommonTranslations(locale)) as any;
  const expirationHours = Math.round(getActivationLinkExpirationSeconds() / 3600);

  return (
    <NotificationPage
      type="error"
      title={t.notificationPages.expired.title}
      message={t.notificationPages.expired.message.replace(
        '{{expirationHours}}',
        String(expirationHours)
      )}
      goToFrontPageText={t.notificationPages.expired.goToFrontendPage}
    />
  );
}
