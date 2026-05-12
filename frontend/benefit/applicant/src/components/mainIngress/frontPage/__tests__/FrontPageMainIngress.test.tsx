import { screen } from '@testing-library/react';
import renderComponent from 'benefit/applicant/__tests__/utils/render-component';
import { setupUserAndRender } from 'benefit/applicant/__tests__/utils/user-render-helper';
import React from 'react';

import i18n from '../../../../../test/i18n/i18n-test';
import useCloneApplicationMutation from '../../../../hooks/useCloneApplicationMutation';
import FrontPageMainIngress from '../FrontPageMainIngress';
import { useFrontPageMainIngress } from '../useFrontPageMainIngress';

jest.mock(
  'benefit/applicant/components/mainIngress/frontPage/useFrontPageMainIngress'
);
jest.mock('benefit/applicant/hooks/useCloneApplicationMutation');

const mockUseFrontPageMainIngress = useFrontPageMainIngress as jest.Mock;
const mockUseCloneApplicationMutation =
  useCloneApplicationMutation as jest.Mock;

const t = i18n.t.bind(i18n);

const headingText = 'Hakemukset';
const newApplicationBtnText = 'Tee uusi hakemus';
const cloneHelperText = 'Pohjana käytetään viimeksi lähetettyä hakemusta';

const setupHook = (overrides: Record<string, unknown> = {}): jest.Mock => {
  const handleNewApplicationClick = jest.fn();
  mockUseFrontPageMainIngress.mockReturnValue({
    t,
    handleNewApplicationClick,
    handleMoreInfoClick: jest.fn(),
    ...overrides,
  });
  return handleNewApplicationClick;
};

const setupClone = (
  overrides: Record<string, unknown> = {}
): { cloneApplication: jest.Mock } => {
  const cloneApplication = jest.fn();
  mockUseCloneApplicationMutation.mockReturnValue({
    data: null,
    mutate: cloneApplication,
    ...overrides,
  });
  return { cloneApplication };
};

const renderPage = (): ReturnType<typeof renderComponent> =>
  renderComponent(<FrontPageMainIngress />, {
    locale: 'fi',
    defaultLocale: 'fi',
    locales: ['fi', 'sv', 'en'],
  });

describe('FrontPageMainIngress', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupHook();
    setupClone();
  });

  it('renders the heading and description texts', () => {
    renderPage();

    expect(screen.getByText(headingText)).toBeInTheDocument();
    expect(
      screen.getByText(/Tervetuloa Helsinki-lisän asiointipalveluun\./)
    ).toBeInTheDocument();
  });

  it('renders the new application button and clone button', () => {
    renderPage();

    expect(
      screen.getByRole('button', { name: newApplicationBtnText })
    ).toBeInTheDocument();
    // clone button uses aria-labelledby pointing to its helper text
    expect(
      screen.getByRole('button', { name: cloneHelperText })
    ).toBeInTheDocument();
  });

  it('calls handleNewApplicationClick when new application button is clicked', async () => {
    const handleNewApplicationClick = setupHook();
    const user = setupUserAndRender(() => {
      renderPage();
    });

    await user.click(
      screen.getByRole('button', { name: newApplicationBtnText })
    );

    expect(handleNewApplicationClick).toHaveBeenCalledTimes(1);
  });

  it('calls cloneApplication mutation when clone button is clicked', async () => {
    const { cloneApplication } = setupClone();
    const user = setupUserAndRender(() => {
      renderPage();
    });

    await user.click(screen.getByRole('button', { name: cloneHelperText }));

    expect(cloneApplication).toHaveBeenCalledTimes(1);
  });

  it('pushes to application route when cloned data has an id', () => {
    const push = jest.fn();
    setupClone({ data: { id: 'abc-123' } });

    renderComponent(<FrontPageMainIngress />, {
      locale: 'fi',
      defaultLocale: 'fi',
      locales: ['fi', 'sv', 'en'],
      push,
    });

    expect(push).toHaveBeenCalledWith('/application?id=abc-123');
  });
});
