import '@testing-library/jest-dom';

import { screen } from '@testing-library/react';
import renderComponent from 'benefit/handler/__tests__/utils/render-component';
import { setupUserAndRender } from 'benefit/handler/__tests__/utils/user-render-helper';
import { ROUTES } from 'benefit/handler/constants';
import React from 'react';

import MainIngress from '../MainIngress';

const mockPush = jest.fn();

jest.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

const renderSubject = (): ReturnType<typeof renderComponent> =>
  renderComponent(<MainIngress />);

describe('MainIngress', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders ingress container, heading and action button text', () => {
    renderSubject();

    expect(screen.getByTestId('main-ingress')).toBeInTheDocument();
    expect(screen.getByText('Hakemukset')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Syötä hakemus' })
    ).toBeInTheDocument();
  });

  it('navigates to new application form route when action button is clicked', async () => {
    const user = setupUserAndRender(() => {
      renderSubject();
    });

    await user.click(screen.getByRole('button', { name: 'Syötä hakemus' }));

    expect(mockPush).toHaveBeenCalledWith(ROUTES.APPLICATION_FORM_NEW);
  });
});
