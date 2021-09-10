import { TFunction } from 'next-i18next';
import { SUPPORTED_LANGUAGES } from 'shared/i18n/i18n';
import { OptionType } from 'shared/types/common';

export const getLanguageOptions = (
  t: TFunction,
  containerKey: string
): OptionType[] => {
  const createOptions = (languages: string[]): OptionType[] =>
    languages.map((language) => ({
      label: t(`common:${containerKey}.${language}`),
      value: language,
    }));

  // cimode goes here, not implemented

  return createOptions(Object.values(SUPPORTED_LANGUAGES));
};
