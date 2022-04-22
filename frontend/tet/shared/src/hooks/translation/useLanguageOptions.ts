// eslint-disable-next-line import/no-extraneous-dependencies
import { useTranslation } from 'next-i18next';
import { OptionType } from 'tet-shared/types/classification';

const useLanguageOptions = (): OptionType[] => {
  const { t } = useTranslation();
  return [
    {
      name: 'fi',
      value: 'fi',
      label: t('common:editor.posting.contactLanguageFi'),
    },
    {
      name: 'sv',
      value: 'sv',
      label: t('common:editor.posting.contactLanguageSv'),
    },
    {
      name: 'en',
      value: 'en',
      label: t('common:editor.posting.contactLanguageEn'),
    },
  ];
};

export default useLanguageOptions;
