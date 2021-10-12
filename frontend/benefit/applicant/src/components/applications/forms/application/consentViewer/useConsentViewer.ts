import useLocale from 'benefit/applicant/hooks/useLocale';
import { useTranslation } from 'benefit/applicant/i18n';
import { TFunction } from 'next-i18next';
import { capitalize } from 'shared/utils/string.utils';

type ExtendedComponentProps = {
  t: TFunction;
  textLocale: string;
  cbPrefix: string;
};

const useConsentViewer = (): ExtendedComponentProps => {
  const { t } = useTranslation();
  const locale = useLocale();
  const textLocale = capitalize(locale);
  const cbPrefix = 'application_conset_read-only';

  return {
    textLocale,
    cbPrefix,
    t,
  };
};

export { useConsentViewer };
