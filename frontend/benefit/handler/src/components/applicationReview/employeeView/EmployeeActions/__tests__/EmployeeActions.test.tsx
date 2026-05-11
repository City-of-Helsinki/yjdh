import '@testing-library/jest-dom';

import { screen } from '@testing-library/react';
import renderComponent from 'benefit/handler/__tests__/utils/render-component';
import { setupUserAndRender } from 'benefit/handler/__tests__/utils/user-render-helper';
import { ROUTES } from 'benefit/handler/constants';
import React from 'react';

import EmployeeActions from '../EmployeeActions';

const mockPush = jest.fn();

jest.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

const renderSubject = (): ReturnType<typeof renderComponent> =>
  renderComponent(<EmployeeActions />);

const getAddPreviouslyGrantedBenefitButton = (): HTMLElement =>
  screen.getByRole('button', { name: 'Lisää aikaisempi lisä' });

describe('EmployeeActions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders previously granted benefit action button', () => {
    renderSubject();

    expect(getAddPreviouslyGrantedBenefitButton()).toBeInTheDocument();
  });

  it('navigates to home when action button is clicked', async () => {
    const user = setupUserAndRender(() => {
      renderSubject();
    });

    await user.click(getAddPreviouslyGrantedBenefitButton());

    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith(ROUTES.HOME);
  });
});
