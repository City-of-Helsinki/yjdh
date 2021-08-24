import { screen, waitFor } from 'shared/__tests__/utils/test-utils';

/**
 * This should wait hds LoadingSpinner component to appear and the vanish
 */
export const waitForLoadingSpinnerToComplete = async (): Promise<void> => {
  await waitFor(() => {
    expect(
      screen.queryByRole('alert')
    ).toHaveTextContent('Page is loading');
  });
  await waitFor(() => {
    expect(
      screen.queryByRole('alert')
    ).toHaveTextContent('Page has finished loading');
  });
}

