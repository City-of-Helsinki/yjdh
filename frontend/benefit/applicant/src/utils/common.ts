import { TFunction } from 'next-i18next';
import { SUPPORTED_LANGUAGES } from 'shared/i18n/i18n';
import { OptionType } from 'shared/types/common';

export const getLanguageOptions = (
  t: TFunction,
  containerKey: string
): OptionType<string>[] => {
  const createOptions = (languages: string[]): OptionType<string>[] =>
    languages.map((language) => ({
      label: t(`common:${containerKey}.${language}`),
      value: language,
    }));

  // cimode goes here, not implemented

  return createOptions(Object.values(SUPPORTED_LANGUAGES));
};

export const getApplicationStepFromString = (step: string): number => {
  try {
    return parseInt(step.split('_')[1], 10);
  } catch (error) {
    return 1;
  }
};

export const getApplicationStepString = (step: number): string =>
  `step_${step}`;

export const getApplicantFullName = (
  firstName: string | undefined,
  lastName: string | undefined
): string => `${firstName || ''} ${lastName || ''}`;
