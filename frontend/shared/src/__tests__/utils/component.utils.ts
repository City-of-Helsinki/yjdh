import nock from 'nock';
import {
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from 'shared/__tests__/utils/test-utils';

export const waitForLoadingCompleted = async (): Promise<void> => {
  const isLoading =
    screen.queryAllByTestId('hidden-loading-indicator').length > 0;
  if (isLoading) {
    await waitForElementToBeRemoved(() =>
      screen.queryByTestId('hidden-loading-indicator')
    );
  }
};
/**
 * This should wait until all backend requests to complete
 */
export const waitForBackendRequestsToComplete = async (): Promise<void> => {
  await waitForLoadingCompleted();
  if (nock.pendingMocks().length > 0) {
    console.log('pending nocks', nock.pendingMocks());
    // eslint-disable-next-line testing-library/prefer-find-by
    await waitFor(() => {
      expect(nock.isDone()).toBeTruthy();
    });
    console.log('no more pending nocks');
  }
};
