import { useRouter } from 'next/router';
import { DEFAULT_LANGUAGE, Language } from 'shared/i18n/i18n';
import DraftApplication from 'shared/types/draft-application';

const useGetApplicationLanguage = (): ((
  application: DraftApplication
) => Language) => {
  const { locale } = useRouter();
  return (application: DraftApplication) =>
    application?.language ?? (locale as Language) ?? DEFAULT_LANGUAGE;
};

export default useGetApplicationLanguage;
