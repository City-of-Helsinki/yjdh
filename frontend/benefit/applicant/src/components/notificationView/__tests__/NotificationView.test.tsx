import { screen } from '@testing-library/react';
import renderComponent from 'benefit/applicant/__tests__/utils/render-component';
import { setupUserAndRender } from 'benefit/applicant/__tests__/utils/user-render-helper';
import { ROUTES } from 'benefit/applicant/constants';
import React from 'react';

import NotificationView from '../NotificationView';

const defaultProps = {
  applicationId: 'test-app-id-123',
  title: 'Hakemuksesi on lähetetty',
  message: 'Voit seurata hakemuksesi käsittelyä täältä.',
};

const renderNotificationView = (
  props: Partial<typeof defaultProps> = {},
  routerOverrides: Record<string, unknown> = {}
): ReturnType<typeof renderComponent> =>
  renderComponent(
    <NotificationView {...defaultProps} {...props} />,
    routerOverrides
  );

const getHomeButton = (): HTMLElement =>
  screen.getByRole('button', { name: 'Palaa etusivulle' });

const getViewApplicationButton = (): HTMLElement =>
  screen.getByRole('button', { name: 'Tarkastele lähettämääsi hakemusta' });

describe('NotificationView', () => {
  it('renders the title and message passed as props', () => {
    renderNotificationView();

    expect(screen.getByText(defaultProps.title)).toBeInTheDocument();
    expect(screen.getByText(defaultProps.message)).toBeInTheDocument();
  });

  it('navigates to home route when home button is clicked', async () => {
    const push = jest.fn();
    const user = setupUserAndRender(() => {
      renderNotificationView({}, { push });
    });

    await user.click(getHomeButton());

    expect(push).toHaveBeenCalledWith(ROUTES.HOME);
  });

  it('navigates to application form with id when view application button is clicked', async () => {
    const push = jest.fn();
    const user = setupUserAndRender(() => {
      renderNotificationView({}, { push });
    });

    await user.click(getViewApplicationButton());

    expect(push).toHaveBeenCalledWith({
      pathname: ROUTES.APPLICATION_FORM,
      query: { id: defaultProps.applicationId },
    });
  });
});
