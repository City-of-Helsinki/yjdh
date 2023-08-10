import { TFunction, useTranslation } from 'next-i18next';

interface ApplicationListProps {
  t: TFunction;
  getHeader: (id: string) => string;
  translationsBase: string;
}

const translationsBase = 'common:applications.list';

const useApplicationList = (): ApplicationListProps => {
  const { t } = useTranslation();

  const getHeader = (id: string): string =>
    t(`${translationsBase}.columns.${id}`);

  return {
    t,
    getHeader,
    translationsBase,
  };
};

export { useApplicationList };
