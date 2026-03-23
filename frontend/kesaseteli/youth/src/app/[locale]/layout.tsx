import React from 'react';

import ClientProviders from '../ClientProviders';
import I18nClientProvider from '../I18nClientProvider';
import StyledComponentsRegistry from '../StyledComponentsRegistry';

export async function generateStaticParams() {
  return [{ locale: 'fi' }, { locale: 'en' }, { locale: 'sv' }];
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const resolvedParams = await params;
  const {locale} = resolvedParams;

  // Prevent crashes when Next.js passes non-locale strings (like favicon.ico) to the layout
  const locales = ['fi', 'en', 'sv'];
  if (!locales.includes(locale)) {
    return null;
  }

  // Bypass react-i18next entirely on the server to prevent React Context errors
  const commonNs = (await import(`../../../public/locales/${locale}/common.json`)).default;

  const i18nConfig = {
    initialLocale: locale,
    initialI18nStore: {
      [locale]: {
        common: commonNs,
      },
    },
    ns: ['common'],
  };

  return (
    <html lang={locale}>
      <body>
        <StyledComponentsRegistry>
          <I18nClientProvider i18nConfig={i18nConfig}>
            <ClientProviders>{children}</ClientProviders>
          </I18nClientProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
