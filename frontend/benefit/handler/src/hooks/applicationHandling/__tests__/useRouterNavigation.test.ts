import { renderHook } from '@testing-library/react-hooks';
import { APPLICATION_LIST_TABS, ROUTES } from 'benefit/handler/constants';
import { APPLICATION_STATUSES, BATCH_STATUSES } from 'benefit-shared/constants';
import { useRouter } from 'next/router';
import { getSessionStorageItem } from 'shared/utils/localstorage.utils';

import { useRouterNavigation } from '../useRouterNavigation';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('shared/utils/localstorage.utils', () => ({
  getSessionStorageItem: jest.fn(),
}));

type MockRouter = {
  pathname: string;
  query: Record<string, string | undefined>;
  push: jest.Mock;
};

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockGetSessionStorageItem = getSessionStorageItem as jest.MockedFunction<
  typeof getSessionStorageItem
>;

type HookParams = Readonly<Parameters<typeof useRouterNavigation>>;

const setupRouter = (overrides: Partial<MockRouter> = {}): MockRouter => {
  const router: MockRouter = {
    pathname: ROUTES.APPLICATION,
    query: { id: 'application-id' },
    push: jest.fn(),
    ...overrides,
  };

  mockUseRouter.mockReturnValue(router as never);

  return router;
};

const navigateAndExpect = (
  expectedRoute: string,
  hookParams: HookParams = [] as HookParams,
  routerOverrides: Partial<MockRouter> = {}
): void => {
  const router = setupRouter(routerOverrides);
  const { result } = renderHook(() => useRouterNavigation(...hookParams));

  void result.current.navigateBack();

  expect(router.push).toHaveBeenCalledWith(expectedRoute);
};

describe('useRouterNavigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    Object.defineProperty(document, 'referrer', {
      configurable: true,
      value: '',
    });

    mockGetSessionStorageItem.mockReturnValue(
      '/applications,/application?id=1'
    );
  });

  it.each([
    [ROUTES.ALTERATIONS, [undefined, undefined, undefined, true]],
    [
      `${ROUTES.APPLICATION}?id=123`,
      [undefined, undefined, undefined, false, '123'],
    ],
  ] as const)(
    'routes to %s when force route is provided',
    (expectedRoute, hookParams) => {
      navigateAndExpect(expectedRoute, hookParams);
    }
  );

  it('routes to alterations when opened from alteration page in new window', () => {
    mockGetSessionStorageItem.mockReturnValue('/application?id=1');

    Object.defineProperty(document, 'referrer', {
      configurable: true,
      value: 'https://example.local/alterations',
    });

    navigateAndExpect(ROUTES.ALTERATIONS);
  });

  it.each([
    ['/archive?appNo=123,/application?id=1', '/archive?appNo=123'],
    ['/applications,/application?id=1', ROUTES.APPLICATIONS_ARCHIVE],
  ] as const)(
    'routes archived views to %s based on previous location',
    (historyValue, expectedRoute) => {
      mockGetSessionStorageItem.mockReturnValue(historyValue);

      navigateAndExpect(expectedRoute, [undefined, undefined, true], {
        pathname: '/some-page',
        query: {},
      });
    }
  );

  it.each([
    [APPLICATION_STATUSES.DRAFT, APPLICATION_LIST_TABS.DRAFT],
    [APPLICATION_STATUSES.RECEIVED, APPLICATION_LIST_TABS.RECEIVED],
    [APPLICATION_STATUSES.HANDLING, APPLICATION_LIST_TABS.HANDLING],
    [APPLICATION_STATUSES.INFO_REQUIRED, APPLICATION_LIST_TABS.HANDLING],
    [APPLICATION_STATUSES.ACCEPTED, APPLICATION_LIST_TABS.ACCEPTED],
    [APPLICATION_STATUSES.REJECTED, APPLICATION_LIST_TABS.REJECTED],
    [undefined, 0],
  ] as const)('maps status %s to tab %s', (status, expectedTab) => {
    navigateAndExpect(`/?tab=${expectedTab}`, [status], {
      pathname: ROUTES.APPLICATION,
      query: { id: '1' },
    });
  });

  it('uses returnTab query over status mapping', () => {
    navigateAndExpect('/?tab=9', [APPLICATION_STATUSES.RECEIVED], {
      pathname: ROUTES.APPLICATION,
      query: { id: '1', returnTab: '9' },
    });
  });

  it('falls back to status mapping when returnTab is not a number', () => {
    navigateAndExpect(
      `/?tab=${APPLICATION_LIST_TABS.REJECTED}`,
      [APPLICATION_STATUSES.REJECTED],
      {
        pathname: ROUTES.APPLICATION,
        query: { id: '1', returnTab: 'not-a-number' },
      }
    );
  });

  it('maps decided accepted batch status to in-payment tab', () => {
    navigateAndExpect(
      `/?tab=${APPLICATION_LIST_TABS.IN_PAYMENT}`,
      [APPLICATION_STATUSES.ACCEPTED, BATCH_STATUSES.DECIDED_ACCEPTED],
      { pathname: ROUTES.APPLICATION, query: { id: '1' } }
    );
  });

  it('falls back to home when previous location parsing fails', () => {
    mockGetSessionStorageItem.mockReturnValue(123 as never);

    navigateAndExpect(ROUTES.HOME, [], {
      pathname: '/not-application',
      query: {},
    });
  });
});
