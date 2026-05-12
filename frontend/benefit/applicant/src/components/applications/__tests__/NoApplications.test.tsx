import { screen } from '@testing-library/react';
import renderComponent from 'benefit/applicant/__tests__/utils/render-component';
import { setupUserAndRender } from 'benefit/applicant/__tests__/utils/user-render-helper';
import { ROUTES } from 'benefit/applicant/constants';
import React from 'react';

import NoApplications from '../NoApplications';

const noApplicationsText = 'Ei avoimia Helsinki-lisä -hakemuksia';
const newApplicationBtnText = 'Tee uusi hakemus';

const renderNoApplications = (
  push = jest.fn()
): ReturnType<typeof renderComponent> =>
  renderComponent(<NoApplications />, {
    locale: 'fi',
    defaultLocale: 'fi',
    push,
  });

describe('NoApplications', () => {
  it('renders the no applications heading', () => {
    renderNoApplications();

    expect(screen.getByText(noApplicationsText)).toBeInTheDocument();
  });

  it('renders the new application button', () => {
    renderNoApplications();

    expect(
      screen.getByRole('button', { name: new RegExp(newApplicationBtnText) })
    ).toBeInTheDocument();
  });

  it('navigates to the application form when the button is clicked', async () => {
    const push = jest.fn();
    const user = setupUserAndRender(() => {
      renderNoApplications(push);
    });

    await user.click(
      screen.getByRole('button', { name: new RegExp(newApplicationBtnText) })
    );

    expect(push).toHaveBeenCalledWith(ROUTES.APPLICATION_FORM);
  });
});
