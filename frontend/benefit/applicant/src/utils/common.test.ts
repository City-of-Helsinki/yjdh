import { TFunction } from 'next-i18next';

import i18n from '../../test/i18n/i18n-test';
import {
  getApplicationStepFromString,
  getApplicationStepString,
  getLanguageOptions,
  translateBackendErrorMessage,
} from './common';

describe('common utils', () => {
  it('returns translated language options for all supported languages', () => {
    const t = i18n.t.bind(i18n);

    expect(getLanguageOptions(t, 'languages')).toEqual([
      { label: 'Suomi', value: 'fi' },
      { label: 'Ruotsi', value: 'sv' },
      { label: 'English', value: 'en' },
    ]);
  });

  it('translates backend error message using the error message key', () => {
    const t = i18n.t.bind(i18n);

    expect(
      translateBackendErrorMessage(
        t,
        new Error('Request failed with status code 500')
      )
    ).toBe('Virhe taustajärjestelmässä. Kokeile myöhemmin uudestaan.');
  });

  it('falls back to notifications error title when backend error translation is missing', () => {
    const t = ((key: string): string =>
      key === 'common:notifications.error.title'
        ? 'Tapahtui virhe'
        : '') as TFunction;

    expect(translateBackendErrorMessage(t, new Error('missing_error'))).toBe(
      'Tapahtui virhe'
    );
  });

  it('returns NaN when application step string is invalid', () => {
    expect(getApplicationStepFromString('invalid')).toBeNaN();
  });

  it('returns 1 when application step value throws during parsing', () => {
    expect(getApplicationStepFromString(undefined as unknown as string)).toBe(
      1
    );
  });

  it('parses application step number from step string', () => {
    expect(getApplicationStepFromString('step_6')).toBe(6);
  });

  it('formats application step string from step number', () => {
    expect(getApplicationStepString(6)).toBe('step_6');
  });
});
