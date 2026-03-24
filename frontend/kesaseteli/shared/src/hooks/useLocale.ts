import { useParams } from 'next/navigation';
import {
  DEFAULT_LANGUAGE,
  Language,
} from 'shared/i18n/i18n';

const useLocale = (): Language => {
  const params = useParams();
  return (params?.locale as Language) || DEFAULT_LANGUAGE;
};

export default useLocale;
