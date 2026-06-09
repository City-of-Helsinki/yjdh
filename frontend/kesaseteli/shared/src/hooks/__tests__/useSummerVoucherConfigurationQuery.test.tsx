import { renderHook } from '@testing-library/react-hooks';
import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';
import SummerVoucherConfiguration from 'kesaseteli-shared/types/summer-voucher-configuration';
import nock from 'nock';
import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import BackendAPIProvider from 'shared/backend-api/BackendAPIProvider';
import useErrorHandler from 'shared/hooks/useErrorHandler';
import useLocale from 'shared/hooks/useLocale';

import useSummerVoucherConfigurationQuery from '../useSummerVoucherConfigurationQuery';

const API_BASE_TEST_URL = 'http://kesaseteli-api';

type Language = 'fi' | 'sv' | 'en';
type LanguageSummerVoucherConfigurations = Record<
  Language,
  SummerVoucherConfiguration[]
>;

const languages = ['fi', 'sv', 'en'] as const;

const languageDataMock = languages.reduce<LanguageSummerVoucherConfigurations>(
  (acc, lang: typeof languages[number]) => ({
    ...acc,
    [lang]: [
      {
        target_groups: [
          {
            id: 'primary_target_group',
            name: `name-${lang}`,
            description: `description-${lang}`,
          },
        ],
      },
    ],
  }),
  {} as LanguageSummerVoucherConfigurations
);

jest.mock('next-i18next', () => ({
  useTranslation: jest.fn(),
}));

jest.mock('shared/hooks/useErrorHandler', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('shared/hooks/useLocale', () => jest.fn());

const mockUseTranslation = jest.requireMock<{
  useTranslation: jest.Mock;
}>('next-i18next').useTranslation;
const mockUseErrorHandler = useErrorHandler as jest.Mock;
const mockUseLocale = useLocale as jest.Mock;
const mockErrorHandler = jest.fn();

describe('useSummerVoucherConfigurationQuery', () => {
  beforeAll(() => {
    nock.disableNetConnect();
  });

  afterAll(() => {
    nock.enableNetConnect();
  });

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <BackendAPIProvider baseURL={API_BASE_TEST_URL}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </BackendAPIProvider>
  );

  beforeEach(() => {
    queryClient.clear();
    nock.cleanAll();
    mockUseErrorHandler.mockReturnValue(mockErrorHandler);
    jest.clearAllMocks();
  });

  it('returns target groups in the requested language (fi, sv, en)', async () => {
    const firstLang = languages[0];
    mockUseTranslation.mockReturnValue({
      i18n: { language: firstLang },
    });
    mockUseLocale.mockReturnValue(firstLang);

    nock(API_BASE_TEST_URL, {
      reqheaders: {
        'accept-language': firstLang,
      },
    })
      .get(BackendEndpoint.SUMMER_VOUCHER_CONFIGURATION)
      .reply(200, languageDataMock[firstLang]);

    const { result, waitFor, rerender } = renderHook(
      () => useSummerVoucherConfigurationQuery(),
      { wrapper }
    );

    await waitFor(() => result.current.isSuccess);
    expect(result.current.data).toEqual(languageDataMock[firstLang]);
    expect(nock.isDone()).toBe(true);

    // Test remaining languages
    for (let i = 1; i < languages.length; i += 1) {
      const lang = languages[i];
      mockUseTranslation.mockReturnValue({
        i18n: { language: lang },
      });
      mockUseLocale.mockReturnValue(lang);

      nock(API_BASE_TEST_URL, {
        reqheaders: {
          'accept-language': lang,
        },
      })
        .get(BackendEndpoint.SUMMER_VOUCHER_CONFIGURATION)
        .reply(200, languageDataMock[lang]);

      rerender();
      await waitFor(() => result.current.isSuccess, { timeout: 5000 });

      expect(result.current.data).toEqual(languageDataMock[lang]);
      expect(nock.isDone()).toBe(true);
    }
  });

  it('calls useErrorHandler on error', async () => {
    mockUseTranslation.mockReturnValue({
      i18n: { language: languages[0] },
    });
    mockUseLocale.mockReturnValue(languages[0]);

    nock(API_BASE_TEST_URL)
      .get(BackendEndpoint.SUMMER_VOUCHER_CONFIGURATION)
      .reply(500);

    const { result, waitFor } = renderHook(
      () => useSummerVoucherConfigurationQuery(),
      { wrapper }
    );

    await waitFor(() => result.current.isError);

    expect(mockErrorHandler).toHaveBeenCalled();
    expect(nock.isDone()).toBe(true);
  });
});
