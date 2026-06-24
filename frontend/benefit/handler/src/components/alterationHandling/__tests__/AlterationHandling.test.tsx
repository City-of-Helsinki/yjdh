import { RenderResult, screen } from '@testing-library/react';
import {
  createAlteration,
  createAlterationApplication,
} from 'benefit/handler/__tests__/utils/alteration-fixtures';
import renderComponent from 'benefit/handler/__tests__/utils/render-component';
import { setupUserAndRender } from 'benefit/handler/__tests__/utils/user-render-helper';
import AlterationHandling from 'benefit/handler/components/alterationHandling/AlterationHandling';
import useAlterationHandling from 'benefit/handler/components/alterationHandling/useAlterationHandling';
import { ROUTES } from 'benefit/handler/constants';
import { ALTERATION_STATE } from 'benefit-shared/constants';
import {
  Application,
  ApplicationAlteration,
} from 'benefit-shared/types/application';
import React from 'react';
import hdsToast from 'shared/components/toast/Toast';

jest.mock(
  'benefit/handler/components/alterationHandling/useAlterationHandling'
);
jest.mock('shared/components/toast/Toast', () => jest.fn());
jest.mock(
  'react-loading-skeleton',
  () =>
    function MockSkeleton(): React.ReactElement {
      return <div data-testid="loading-skeleton" />;
    }
);
jest.mock(
  'benefit/handler/components/applicationHeader/ApplicationHeader',
  () =>
    function MockApplicationHeader(): React.ReactElement {
      return <div data-testid="application-header" />;
    }
);
jest.mock(
  'benefit/handler/components/alterationHandling/AlterationHandlingForm',
  () =>
    function MockAlterationHandlingForm({
      onSuccess,
      onError,
    }: {
      onSuccess: (isRecoverable: boolean) => void;
      onError: (error: unknown) => void;
    }): React.ReactElement {
      return (
        <div data-testid="alteration-handling-form">
          <button type="button" onClick={() => onSuccess(true)}>
            success-recoverable
          </button>
          <button type="button" onClick={() => onSuccess(false)}>
            success-nonrecoverable
          </button>
          <button
            type="button"
            onClick={() =>
              onError({
                response: {
                  data: {
                    recovery_justification: ['Pakollinen tieto'],
                    unknown_field: 'Tuntematon virhe',
                  },
                },
              })
            }
          >
            trigger-error
          </button>
        </div>
      );
    }
);

const mockPush = jest.fn();

jest.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

const mockUseAlterationHandling = useAlterationHandling as jest.MockedFunction<
  typeof useAlterationHandling
>;
const mockHdsToast = hdsToast as jest.MockedFunction<typeof hdsToast>;

const labels = {
  returnToApplication: 'Palaa hakemukseen',
  returnToAlterationList: 'Palaa muutosilmoituksiin',
};

const application: Application = createAlterationApplication();

const baseAlteration: ApplicationAlteration = createAlteration();

const renderSubject = (): RenderResult =>
  renderComponent(<AlterationHandling />).renderResult;

const getButton = (name: string): HTMLElement =>
  screen.getByRole('button', { name });

describe('AlterationHandling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAlterationHandling.mockReturnValue({
      application,
      alteration: baseAlteration,
      isLoading: false,
    } as never);
  });

  it('renders loading skeletons while data is loading', () => {
    mockUseAlterationHandling.mockReturnValue({
      application: undefined,
      alteration: undefined,
      isLoading: true,
    } as never);

    renderSubject();

    expect(screen.getAllByTestId('loading-skeleton')).toHaveLength(6);
  });

  it('shows application not found state and routes to alteration list', async () => {
    mockUseAlterationHandling.mockReturnValue({
      application: undefined,
      alteration: undefined,
      isLoading: false,
    } as never);

    const user = setupUserAndRender(() => {
      renderSubject();
    });

    expect(
      screen.getByRole('heading', { name: 'Käsittele muutosilmoitus' })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'applications.alterations.handling.error.applicationNotFound'
      )
    ).toBeInTheDocument();

    await user.click(getButton(labels.returnToAlterationList));

    expect(mockPush).toHaveBeenCalledWith(ROUTES.ALTERATIONS);
  });

  it('renders application header and handling form when alteration is handleable', () => {
    renderSubject();

    expect(screen.getByTestId('application-header')).toBeInTheDocument();
    expect(screen.getByTestId('alteration-handling-form')).toBeInTheDocument();
  });

  it('shows already handled state and routes back to application', async () => {
    mockUseAlterationHandling.mockReturnValue({
      application,
      alteration: { ...baseAlteration, state: ALTERATION_STATE.HANDLED },
      isLoading: false,
    } as never);

    const user = setupUserAndRender(() => {
      renderSubject();
    });

    expect(
      screen.getByText('Valittu muutosilmoitus on jo käsitelty!')
    ).toBeInTheDocument();

    await user.click(getButton(labels.returnToApplication));

    expect(mockPush).toHaveBeenCalledWith(`${ROUTES.APPLICATION}/?id=app-id`);
  });

  it('shows alteration not found state and routes back to application', async () => {
    mockUseAlterationHandling.mockReturnValue({
      application,
      alteration: undefined,
      isLoading: false,
    } as never);

    const user = setupUserAndRender(() => {
      renderSubject();
    });

    expect(
      screen.getByText('Valittua muutosilmoitusta ei löytynyt!')
    ).toBeInTheDocument();

    await user.click(getButton(labels.returnToApplication));

    expect(mockPush).toHaveBeenCalledWith(`${ROUTES.APPLICATION}/?id=app-id`);
  });

  it('shows recoverable success toast and routes to application on success', async () => {
    const user = setupUserAndRender(() => {
      renderSubject();
    });

    await user.click(
      screen.getByRole('button', { name: 'success-recoverable' })
    );

    expect(mockHdsToast).toHaveBeenCalledWith(
      expect.objectContaining({
        autoDismissTime: 0,
        type: 'success',
        labelText: 'Muutosilmoitus on käsitelty',
        text: 'Käsittelit hakemuksen 42 muutosilmoituksen ja merkitsit takaisinlaskutuspyynnön lähetetyksi Talpaan.',
      })
    );
    expect(mockPush).toHaveBeenCalledWith(`${ROUTES.APPLICATION}?id=app-id`);
  });

  it('shows nonrecoverable success toast on success', async () => {
    const user = setupUserAndRender(() => {
      renderSubject();
    });

    await user.click(
      screen.getByRole('button', { name: 'success-nonrecoverable' })
    );

    expect(mockHdsToast).toHaveBeenCalledWith(
      expect.objectContaining({
        text: 'Käsittelit hakemuksen 42 muutosilmoituksen ilman takaisinlaskutusta.',
      })
    );
  });

  it('shows field-specific errors in error toast', async () => {
    const user = setupUserAndRender(() => {
      renderSubject();
    });

    await user.click(screen.getByRole('button', { name: 'trigger-error' }));

    expect(mockHdsToast).toHaveBeenCalledWith(
      expect.objectContaining({
        autoDismissTime: 0,
        type: 'error',
        labelText: 'Odottamaton virhe',
        text: expect.any(Array),
      })
    );

    const toastText = mockHdsToast.mock.calls.at(-1)?.[0].text;
    const { getByRole, getByText } = renderComponent(
      <ul>{toastText}</ul>
    ).renderResult;

    expect(
      getByRole('link', { name: 'Selite: Pakollinen tieto' })
    ).toHaveAttribute('href', '#recovery-justification');
    expect(getByText('Tuntematon virhe')).toBeInTheDocument();
  });
});
