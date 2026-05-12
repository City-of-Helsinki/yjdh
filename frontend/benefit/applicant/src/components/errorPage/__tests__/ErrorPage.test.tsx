import { screen } from '@testing-library/react';
import renderComponent from 'benefit/applicant/__tests__/utils/render-component';
import { setupUserAndRender } from 'benefit/applicant/__tests__/utils/user-render-helper';
import ErrorPage, {
  ErrorPageProps,
} from 'benefit/applicant/components/errorPage/ErrorPage';
import React from 'react';

import i18n from '../../../../test/i18n/i18n-test';
import { useErrorPage } from '../useErrorPage';

jest.mock('benefit/applicant/components/errorPage/useErrorPage');

const mockUseErrorPage = useErrorPage as jest.Mock;
const t = i18n.t.bind(i18n);
const homeActionLabel = 'Palaa etusivulle';
const logoutActionLabel = 'Kirjaudu ulos';

const defaultProps: ErrorPageProps = {
  title: 'Oops',
  message: 'Something went wrong',
};

const setupHook = (overrides = {}): void => {
  mockUseErrorPage.mockReturnValue({
    t,
    handleBackClick: jest.fn(),
    handleLogout: jest.fn(),
    ...overrides,
  });
};

const renderErrorPage = (
  props: Partial<ErrorPageProps> = {}
): ReturnType<typeof renderComponent> =>
  renderComponent(<ErrorPage {...defaultProps} {...props} />);

describe('ErrorPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupHook();
  });

  it('renders title and message', () => {
    renderErrorPage();

    expect(screen.getByRole('heading', { name: 'Oops' })).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('does not render action buttons when showActions is not provided', () => {
    renderErrorPage();

    expect(
      screen.queryByRole('button', { name: homeActionLabel })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: logoutActionLabel })
    ).not.toBeInTheDocument();
  });

  it('renders only home action and calls handleBackClick when clicked', async () => {
    const handleBackClick = jest.fn();
    setupHook({ handleBackClick });
    const user = setupUserAndRender(() => {
      renderErrorPage({
        showActions: { linkToRoot: true, linkToLogout: false },
      });
    });

    const homeButton = screen.getByRole('button', { name: homeActionLabel });
    expect(
      screen.queryByRole('button', { name: logoutActionLabel })
    ).not.toBeInTheDocument();

    await user.click(homeButton);

    expect(handleBackClick).toHaveBeenCalled();
  });

  it('renders only logout action and calls handleLogout when clicked', async () => {
    const handleLogout = jest.fn();
    setupHook({ handleLogout });
    const user = setupUserAndRender(() => {
      renderErrorPage({
        showActions: { linkToRoot: false, linkToLogout: true },
      });
    });

    const logoutButton = screen.getByRole('button', {
      name: logoutActionLabel,
    });
    expect(
      screen.queryByRole('button', { name: homeActionLabel })
    ).not.toBeInTheDocument();

    await user.click(logoutButton);

    expect(handleLogout).toHaveBeenCalled();
  });

  it('renders both actions when both flags are true', () => {
    renderErrorPage({ showActions: { linkToRoot: true, linkToLogout: true } });

    expect(
      screen.getByRole('button', { name: homeActionLabel })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: logoutActionLabel })
    ).toBeInTheDocument();
  });
});
