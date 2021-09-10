import { TFunction } from 'next-i18next';
import { SUPPORTED_LANGUAGES } from 'shared/i18n/i18n';
import { OptionType } from 'shared/types/common';

import hdsToast from '../components/toast/Toast';

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

export const getApplicationStepFromString = (step: string): number => {
  try {
    return parseInt(step.split('_')[1], 10);
  } catch (error) {
    return 1;
  }
};

export const getApplicationStepString = (step: number): string =>
  `step_${step}`;

export const showErrorToast = (title: string, message: string): void =>
  void hdsToast({
    autoDismiss: true,
    autoDismissTime: 5000,
    type: 'error',
    translated: true,
    labelText: title,
    text: message,
  });
