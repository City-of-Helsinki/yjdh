import '@testing-library/jest-dom';

import { screen } from '@testing-library/react';
import { createAlterationApplication } from 'benefit/handler/__tests__/utils/alteration-fixtures';
import renderComponent from 'benefit/handler/__tests__/utils/render-component';
import { setupUserAndRender } from 'benefit/handler/__tests__/utils/user-render-helper';
import useRequireAdditionalInformation from 'benefit/handler/hooks/useRequireAdditionalInformation';
import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import React from 'react';

import EditAction from '../EditAction';

jest.mock('benefit/handler/hooks/useRequireAdditionalInformation');

const mockUseRequireAdditionalInformation =
  useRequireAdditionalInformation as jest.MockedFunction<
    typeof useRequireAdditionalInformation
  >;

const mutate = jest.fn();

const buildHookResult = (
  isLoading = false
): ReturnType<typeof useRequireAdditionalInformation> =>
  ({
    mutate,
    isLoading,
  } as unknown as ReturnType<typeof useRequireAdditionalInformation>);

const renderSubject = (
  status: APPLICATION_STATUSES
): ReturnType<typeof renderComponent> =>
  renderComponent(
    <EditAction
      application={createAlterationApplication({ id: 'test-id', status })}
    />
  );

const getOpenForEditingButton = (): HTMLElement =>
  screen.getByRole('button', { name: 'Avaa muokattavaksi' });
const getLockButton = (): HTMLElement =>
  screen.getByRole('button', { name: 'Lukitse hakemus' });
const queryOpenForEditingButton = (): HTMLElement | null =>
  screen.queryByRole('button', { name: 'Avaa muokattavaksi' });
const queryLockButton = (): HTMLElement | null =>
  screen.queryByRole('button', { name: 'Lukitse hakemus' });

describe('EditAction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRequireAdditionalInformation.mockReturnValue(buildHookResult());
  });

  it('renders "Avaa muokattavaksi" button when status is HANDLING', () => {
    renderSubject(APPLICATION_STATUSES.HANDLING);

    expect(getOpenForEditingButton()).toBeInTheDocument();
    expect(queryLockButton()).not.toBeInTheDocument();
  });

  it('renders "Lukitse hakemus" button when status is INFO_REQUIRED', () => {
    renderSubject(APPLICATION_STATUSES.INFO_REQUIRED);

    expect(getLockButton()).toBeInTheDocument();
    expect(queryOpenForEditingButton()).not.toBeInTheDocument();
  });

  it('renders no action button for other statuses', () => {
    renderSubject(APPLICATION_STATUSES.ACCEPTED);

    expect(queryOpenForEditingButton()).not.toBeInTheDocument();
    expect(queryLockButton()).not.toBeInTheDocument();
  });

  it('calls mutate with INFO_REQUIRED when clicking "Avaa muokattavaksi"', async () => {
    const user = setupUserAndRender(() =>
      renderSubject(APPLICATION_STATUSES.HANDLING)
    );

    await user.click(getOpenForEditingButton());

    expect(mutate).toHaveBeenCalledTimes(1);
    expect(mutate).toHaveBeenCalledWith({
      id: 'test-id',
      status: APPLICATION_STATUSES.INFO_REQUIRED,
    });
  });

  it('calls mutate with HANDLING when clicking "Lukitse hakemus"', async () => {
    const user = setupUserAndRender(() =>
      renderSubject(APPLICATION_STATUSES.INFO_REQUIRED)
    );

    await user.click(getLockButton());

    expect(mutate).toHaveBeenCalledTimes(1);
    expect(mutate).toHaveBeenCalledWith({
      id: 'test-id',
      status: APPLICATION_STATUSES.HANDLING,
    });
  });
});
