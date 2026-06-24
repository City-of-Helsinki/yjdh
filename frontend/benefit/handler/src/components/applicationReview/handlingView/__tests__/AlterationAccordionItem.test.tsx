import {
  act,
  render,
  RenderResult,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  createAlteration,
  createAlterationApplication,
  createHandledAlteration,
} from 'benefit/handler/__tests__/utils/alteration-fixtures';
import { clickDialogButton } from 'benefit/handler/__tests__/utils/modal-test-helpers';
import renderComponent from 'benefit/handler/__tests__/utils/render-component';
import { setupUserAndRender } from 'benefit/handler/__tests__/utils/user-render-helper';
import { ROUTES } from 'benefit/handler/constants';
import useDeleteApplicationAlterationQuery from 'benefit/handler/hooks/useDeleteApplicationAlterationQuery';
import useUpdateApplicationAlterationQuery from 'benefit/handler/hooks/useUpdateApplicationAlterationQuery';
import { ALTERATION_STATE } from 'benefit-shared/constants';
import {
  Application,
  ApplicationAlteration,
} from 'benefit-shared/types/application';
import React from 'react';
import hdsToast from 'shared/components/toast/Toast';

import AlterationAccordionItem from '../AlterationAccordionItem';

const mockPush = jest.fn();
const mutateDeleteAlteration = jest.fn();
const mutateUpdateAlteration = jest.fn();

jest.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock('shared/hooks/useLocale', () => jest.fn(() => 'fi'));
jest.mock('benefit/handler/hooks/useDeleteApplicationAlterationQuery');
jest.mock('benefit/handler/hooks/useUpdateApplicationAlterationQuery');
jest.mock('shared/components/toast/Toast', () => jest.fn());
jest.mock(
  'benefit/handler/components/alterationHandling/AlterationCsvButton',
  () =>
    function MockAlterationCsvButton(): React.ReactElement {
      return <div data-testid="alteration-csv-button" />;
    }
);

const mockUseDeleteApplicationAlterationQuery =
  useDeleteApplicationAlterationQuery as jest.MockedFunction<
    typeof useDeleteApplicationAlterationQuery
  >;

const mockUseUpdateApplicationAlterationQuery =
  useUpdateApplicationAlterationQuery as jest.MockedFunction<
    typeof useUpdateApplicationAlterationQuery
  >;

const mockHdsToast = hdsToast as jest.MockedFunction<typeof hdsToast>;

const labels = {
  beginHandling: 'Käsittele muutosilmoitus',
  delete: 'Poista',
  deleteConfirm: 'Poista',
  cancel: 'Peruuta',
  cancelConfirm: 'Peruuta',
  deleteModalClose: 'Takaisin',
  cancelModalClose: 'Takaisin, älä peruuta',
};

const notifications = {
  deleteErrorLabel: 'Muutosilmoituksen käsittely epäonnistui',
  genericErrorText: 'Ole hyvä ja kokeile myöhemmin uudestaan.',
};

const baseAlteration: ApplicationAlteration = createAlteration();

const baseApplication: Application = createAlterationApplication({
  company: {
    streetAddress: 'Testikatu 1',
    postcode: '00100',
    city: 'Helsinki',
  } as Application['company'],
});

const renderSubject = (
  alteration: ApplicationAlteration = baseAlteration,
  application: Application = baseApplication
): RenderResult =>
  renderComponent(
    <AlterationAccordionItem
      alteration={alteration}
      application={application}
    />
  ).renderResult;

const openAccordion = async (
  user: ReturnType<typeof userEvent.setup>
): Promise<void> => {
  await user.click(screen.getByRole('button', { expanded: false }));
};

const getButton = (name: string): HTMLElement =>
  screen.getByRole('button', { name });

const clickButton = async (
  name: string,
  user: ReturnType<typeof userEvent.setup>
): Promise<void> => {
  await user.click(getButton(name));
};

describe('AlterationAccordionItem', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseDeleteApplicationAlterationQuery.mockReturnValue({
      mutate: mutateDeleteAlteration,
      status: 'idle',
    } as never);

    mockUseUpdateApplicationAlterationQuery.mockReturnValue({
      mutate: mutateUpdateAlteration,
      status: 'idle',
    } as never);
  });

  it('shows begin handling and delete actions for received alteration', async () => {
    const user = setupUserAndRender(() => renderSubject());
    await openAccordion(user);

    expect(getButton(labels.beginHandling)).toBeInTheDocument();
    expect(getButton(labels.delete)).toBeInTheDocument();
  });

  it('routes to handling page when begin handling is clicked', async () => {
    const user = setupUserAndRender(() => renderSubject());

    await openAccordion(user);
    await user.click(getButton(labels.beginHandling));

    expect(mockPush).toHaveBeenCalledWith(
      `${ROUTES.HANDLE_ALTERATION}/?applicationId=${baseAlteration.application}&alterationId=${baseAlteration.id}`
    );
  });

  it('calls delete mutation when deletion is confirmed', async () => {
    const user = setupUserAndRender(() => renderSubject());

    await openAccordion(user);
    await clickButton(labels.delete, user);
    await clickDialogButton(labels.deleteConfirm, user);

    expect(mutateDeleteAlteration).toHaveBeenCalledWith(
      { id: String(baseAlteration.id), applicationId: baseApplication.id },
      expect.objectContaining({
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      })
    );

    const callbacks = mutateDeleteAlteration.mock.calls[0]?.[1];

    await act(async () => {
      callbacks?.onSuccess?.();
    });

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    expect(mockHdsToast).toHaveBeenCalledWith(
      expect.objectContaining({
        autoDismissTime: 0,
        type: 'success',
        labelText: 'Saapunut työsuhteen muutosilmoitus on poistettu',
        text: 'Poistit hakemukselle 42 tehdyn ilmoituksen työsuhteen muutoksesta.',
      })
    );
  });

  it('shows generic error toast when delete fails with html response', async () => {
    const user = setupUserAndRender(() => renderSubject());

    await openAccordion(user);
    await clickButton(labels.delete, user);
    await clickDialogButton(labels.deleteConfirm, user);

    const callbacks = mutateDeleteAlteration.mock.calls[0]?.[1];

    await act(async () => {
      callbacks?.onError?.({
        response: { data: '<html>error</html>' },
      } as never);
    });

    expect(mockHdsToast).toHaveBeenCalledWith(
      expect.objectContaining({
        autoDismissTime: 0,
        type: 'error',
        labelText: notifications.deleteErrorLabel,
        text: notifications.genericErrorText,
      })
    );
  });

  it('closes delete modal when cancel button is clicked', async () => {
    const user = setupUserAndRender(() => renderSubject());

    await openAccordion(user);
    await clickButton(labels.delete, user);
    await clickDialogButton(labels.deleteModalClose, user);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('calls update mutation with cancelled state when handled alteration is cancelled', async () => {
    const user = setupUserAndRender(() =>
      renderSubject(createHandledAlteration())
    );

    await openAccordion(user);
    expect(screen.getByTestId('alteration-csv-button')).toBeInTheDocument();

    await clickButton(labels.cancel, user);
    await clickDialogButton(labels.cancelConfirm, user);

    expect(mutateUpdateAlteration).toHaveBeenCalledWith(
      {
        id: String(baseAlteration.id),
        applicationId: baseApplication.id,
        data: { state: ALTERATION_STATE.CANCELLED },
      },
      expect.objectContaining({
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      })
    );

    const callbacks = mutateUpdateAlteration.mock.calls[0]?.[1];

    await act(async () => {
      callbacks?.onSuccess?.();
    });

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    expect(mockHdsToast).toHaveBeenCalledWith(
      expect.objectContaining({
        autoDismissTime: 0,
        type: 'success',
        labelText: 'Käsitelty takaisinlasku on poistettu',
        text: 'Poistit hakemuksen 42 muutosilmoituksen.',
      })
    );
  });

  it('shows structured error toast when cancellation fails with field errors', async () => {
    const user = setupUserAndRender(() =>
      renderSubject(createHandledAlteration())
    );

    await openAccordion(user);
    await clickButton(labels.cancel, user);
    await clickDialogButton(labels.cancelConfirm, user);

    const callbacks = mutateUpdateAlteration.mock.calls[0]?.[1];

    await act(async () => {
      callbacks?.onError?.({
        response: { data: { recovery_justification: 'Perustelu puuttuu' } },
      } as never);
    });

    const lastToastCall = mockHdsToast.mock.calls.at(-1)?.[0];
    const text = lastToastCall?.text;

    expect(lastToastCall).toEqual(
      expect.objectContaining({
        autoDismissTime: 0,
        type: 'error',
        labelText: notifications.deleteErrorLabel,
        text: expect.any(Array),
      })
    );
    expect(Array.isArray(text)).toBe(true);

    const { getByText } = render(<div>{text}</div>);

    expect(getByText('Perustelu puuttuu')).toBeInTheDocument();
  });

  it('closes cancel modal when cancel button is clicked', async () => {
    const user = setupUserAndRender(() =>
      renderSubject(createHandledAlteration())
    );

    await openAccordion(user);
    await clickButton(labels.cancel, user);
    await clickDialogButton(labels.cancelModalClose, user);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('renders cancelled by user as first name and last initial', async () => {
    const user = setupUserAndRender(() =>
      renderSubject(
        createHandledAlteration({
          state: ALTERATION_STATE.CANCELLED,
          cancelledAt: '2024-07-03',
          cancelledBy: { firstName: 'Kaisa', lastName: 'Korhonen' } as never,
        })
      )
    );

    await openAccordion(user);

    expect(screen.getByText('Kaisa K.')).toBeInTheDocument();
  });

  it('renders einvoice fields instead of postal address when useEinvoice is true', async () => {
    const user = setupUserAndRender(() =>
      renderSubject({
        ...baseAlteration,
        useEinvoice: true,
        einvoiceProviderName: 'Maventa',
        einvoiceProviderIdentifier: '003712345678',
        einvoiceAddress: 'einvoice@example.com',
      })
    );

    await openAccordion(user);

    expect(screen.getByText('Maventa')).toBeInTheDocument();
    expect(screen.getByText('003712345678')).toBeInTheDocument();
    expect(screen.getByText('einvoice@example.com')).toBeInTheDocument();
    expect(screen.queryByText(/Testikatu 1/)).not.toBeInTheDocument();
  });
});
