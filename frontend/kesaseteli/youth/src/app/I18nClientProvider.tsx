'use client';

import React, { useMemo } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

export default function I18nClientProvider({
  children,
  i18nConfig,
}: {
  children: React.ReactNode;
  i18nConfig: any;
}) {
  const i18n = useMemo(() => {
    const instance = i18next.createInstance();
    instance.use(initReactI18next).init({
      lng: i18nConfig.initialLocale,
      resources: i18nConfig.initialI18nStore,
      fallbackLng: i18nConfig.userConfig?.i18n?.defaultLocale || 'fi',
      supportedLngs: i18nConfig.userConfig?.i18n?.locales || ['fi', 'en', 'sv'],
      ns: i18nConfig.ns,
      defaultNS: i18nConfig.ns.includes('common') ? 'common' : i18nConfig.ns[0],
      interpolation: { escapeValue: false },
      react: { useSuspense: false },
    });
    return instance;
  }, [i18nConfig]);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
