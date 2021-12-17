import nock from 'nock';
import { screen, waitFor } from 'shared/__tests__/utils/test-utils';
import { NextRouter } from 'next/router';
import { DEFAULT_LANGUAGE } from 'shared/i18n/i18n';

export const expectBackendRequestsToComplete = (): void => {
  expect(
    screen.queryByTestId('hidden-loading-indicator')
  ).not.toBeInTheDocument();
};

/**
 * This should wait until all backend requests to complete
 */
export const waitForBackendRequestsToComplete = async (): Promise<void> => {
  const isLoading =
    screen.queryAllByTestId('hidden-loading-indicator').length > 0;
  if (isLoading) {
    await waitFor(expectBackendRequestsToComplete);
  }
  if (nock.pendingMocks()) {
    // eslint-disable-next-line testing-library/prefer-find-by
    await waitFor(() => {
      expect(nock.isDone()).toBeTruthy();
    });
  }
  return Promise.resolve();
};
