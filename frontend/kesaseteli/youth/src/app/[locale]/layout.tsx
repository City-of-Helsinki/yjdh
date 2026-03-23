import React from 'react';
import StyledComponentsRegistry from '../StyledComponentsRegistry';
import I18nClientProvider from '../I18nClientProvider';
import ClientProviders from '../ClientProviders';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale;

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
