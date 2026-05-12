import { RenderResult, screen } from '@testing-library/react';
import { createMockApplication } from 'benefit/applicant/__tests__/utils/mock-data';
import renderComponent from 'benefit/applicant/__tests__/utils/render-component';
import { setupUserAndRender } from 'benefit/applicant/__tests__/utils/user-render-helper';
import AlterationPage from 'benefit/applicant/components/applications/alteration/AlterationPage';
import useAlterationPage from 'benefit/applicant/components/applications/alteration/useAlterationPage';
import {
  ALTERATION_STATE,
  ALTERATION_TYPE,
  APPLICATION_STATUSES,
} from 'benefit-shared/constants';
import { NextRouter } from 'next/router';
import React from 'react';

import i18n from '../../../../../test/i18n/i18n-test';

jest.mock(
  'benefit/applicant/components/applications/alteration/useAlterationPage'
);

jest.mock('shared/utils/date.utils', () => ({
  convertToUIDateAndTimeFormat: jest.fn(() => '04.05.2026 10:15'),
  convertToUIDateFormat: jest.fn(() => '04.05.2026'),
}));

const t = i18n.t.bind(i18n);

const baseApplication = createMockApplication({
  id: 'application-id',
  applicationNumber: 20_260_001,
  submittedAt: '2026-05-04T10:15:00Z',
  status: APPLICATION_STATUSES.ACCEPTED,
  employee: {
    firstName: 'Matti',
    lastName: 'Meikalainen',
  },
  alterations: [],
});

const mockPageState = (
  overrides: Record<string, unknown> = {}
): Record<string, unknown> => ({
  t,
  id: 'application-id',
  application: baseApplication,
  isError: false,
  isLoading: false,
  ...overrides,
});

const renderPage = (router: Partial<NextRouter> = {}): RenderResult =>
  renderComponent(<AlterationPage />, router).renderResult;

const mockUseAlterationPage = useAlterationPage as jest.Mock;

describe('AlterationPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAlterationPage.mockReturnValue(mockPageState());
  });

  it('shows a spinner while loading', () => {
    mockUseAlterationPage.mockReturnValue(
      mockPageState({ application: null, isLoading: true })
    );

    renderPage();

    expect(screen.getByRole('status')).toHaveTextContent('Page is loading');
  });

  it('shows the error page when loading fails', () => {
    mockUseAlterationPage.mockReturnValue(
      mockPageState({ application: null, isError: true })
    );

    renderPage();

    expect(
      screen.getByText('Palvelussa on valitettavasti tapahtunut virhe')
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Yritämme todennäköisesti jo korjata ongelmaa. Yritä myöhemmin uudelleen.'
      )
    ).toBeInTheDocument();
  });

  it('renders the accepted application details and routes back from page', async () => {
    const push = jest.fn();
    const user = setupUserAndRender(() => {
      renderPage({ push });
    });

    expect(
      screen.getByRole('button', { name: 'Takaisin' })
    ).toBeInTheDocument();
    expect(
      screen.getByText('Ilmoita työsuhteen muutoksesta')
    ).toBeInTheDocument();
    expect(screen.getByText('Matti Meikalainen')).toBeInTheDocument();
    expect(
      screen.getByText(
        /Hakemusnumero:\s*20260001\s*\|\s*Lähetetty\s*04\.05\.2026 10:15/,
        { selector: 'p' }
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Ilmoita, jos työllistetyn henkilön työsuhde päättyy tai keskeytyy väliaikaisesti tukijakson aikana. Saatamme laskuttaa Helsinki-lisää takaisin, jos tukijakson aikana työsuhteeseen tulee muutoksia.'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText('Kaikki *-merkityt kohdat ovat pakollisia')
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Takaisin' }));

    expect(push).toHaveBeenCalledWith('/application?id=application-id');
  });

  it('shows already terminated message when application has handled termination', () => {
    mockUseAlterationPage.mockReturnValue(
      mockPageState({
        application: {
          ...baseApplication,
          alterations: [
            {
              state: ALTERATION_STATE.HANDLED,
              alterationType: ALTERATION_TYPE.TERMINATION,
            },
          ],
        },
      })
    );

    renderPage();

    expect(
      screen.getByText(
        'Tämä työsuhde on aiemmin jo merkitty päättyneeksi, joten et voi enää ilmoittaa uudesta muutoksesta.'
      )
    ).toBeInTheDocument();
  });

  it('shows not accepted message when application is not yet accepted', () => {
    mockUseAlterationPage.mockReturnValue(
      mockPageState({
        application: { ...baseApplication, status: APPLICATION_STATUSES.DRAFT },
      })
    );

    renderPage();

    expect(
      screen.getByText(
        'Et voi ilmoittaa muutosta työsuhteessa tälle hakemukselle, sillä tukea ei ole vielä myönnetty.'
      )
    ).toBeInTheDocument();
  });
});
