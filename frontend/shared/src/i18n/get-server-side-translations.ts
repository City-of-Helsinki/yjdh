import { SSRConfig } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { DEFAULT_LANGUAGE, I18nNamespace } from 'shared/i18n/i18n';

const getServerSideTranslations = (...namespaces: I18nNamespace[]) => async ({
  locale,
}: {
  locale?: string;
}): Promise<{ props: SSRConfig }> => {
  const lang = locale ?? DEFAULT_LANGUAGE;
  return {
    props: {
      ...(await serverSideTranslations(lang, namespaces)),
    },
  };
};

export default getServerSideTranslations;
