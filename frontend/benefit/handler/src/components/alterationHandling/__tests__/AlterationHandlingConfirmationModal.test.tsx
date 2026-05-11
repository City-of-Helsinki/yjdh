import { RenderResult, screen, within } from '@testing-library/react';
import renderComponent from 'benefit/handler/__tests__/utils/render-component';
import { setupUserAndRender } from 'benefit/handler/__tests__/utils/user-render-helper';
import AlterationHandlingConfirmationModal from 'benefit/handler/components/alterationHandling/AlterationHandlingConfirmationModal';
import { ApplicationAlterationHandlingForm } from 'benefit/handler/types/application';
import React from 'react';

const onClose = jest.fn();
const onSubmit = jest.fn();

const labels = {
  confirm: 'Vahvista',
  cancel: 'Peruuta',
  submitting: 'Lähetetään...',
};

const recoverableValues = {
  isRecoverable: true,
  recoveryStartDate: '1.1.2024',
  recoveryEndDate: '31.1.2024',
  recoveryAmount: '123,45',
  manualRecoveryAmount: '0',
  isManual: false,
} as ApplicationAlterationHandlingForm;

const renderSubject = ({
  values = recoverableValues,
  isWorking = false,
}: {
  values?: ApplicationAlterationHandlingForm;
  isWorking?: boolean;
} = {}): RenderResult =>
  renderComponent(
    <AlterationHandlingConfirmationModal
      isOpen
      onClose={onClose}
      onSubmit={onSubmit}
      isWorking={isWorking}
      values={values}
    />
  ).renderResult;

describe('AlterationHandlingConfirmationModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when values are missing', () => {
    const { container } = renderSubject({ values: undefined });

    expect(container).toBeEmptyDOMElement();
  });

  it('renders recoverable confirmation title and description', () => {
    renderSubject();

    const dialog = screen.getByRole('dialog');

    expect(
      within(dialog).getByText(
        'Olet merkitsemässä laskutustiedot lähetetyksi Talpaan'
      )
    ).toBeInTheDocument();
    expect(
      within(dialog).getByText(
        /Helsinki-lisän ylimääräinen osuus laskutetaan takaisin ajalta 1\.1\.2024–31\.1\.2024, yhteensä 123\s*€\./
      )
    ).toBeInTheDocument();
    expect(
      within(dialog).getByRole('button', { name: labels.confirm })
    ).toBeInTheDocument();
    expect(
      within(dialog).getByRole('button', { name: labels.cancel })
    ).toBeInTheDocument();
  });

  it('renders nonrecoverable confirmation title and description', () => {
    renderSubject({
      values: {
        ...recoverableValues,
        isRecoverable: false,
      },
    });

    const dialog = screen.getByRole('dialog');

    expect(
      within(dialog).getByText(
        'Olet merkitsemässä muutosilmoituksen käsitellyksi. Haluatko jatkaa?'
      )
    ).toBeInTheDocument();
    expect(
      within(dialog).getByText('Ylimääräistä tukea ei laskuteta takaisin.')
    ).toBeInTheDocument();
  });

  it('calls submit and close callbacks from action buttons', async () => {
    const user = setupUserAndRender(() => {
      renderSubject();
    });

    await user.click(screen.getByRole('button', { name: labels.confirm }));
    await user.click(screen.getByRole('button', { name: labels.cancel }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('disables actions while working', () => {
    renderSubject({ isWorking: true });

    expect(screen.getByRole('button', { name: labels.cancel })).toBeDisabled();
    expect(
      screen.getByRole('button', {
        name: labels.submitting,
      })
    ).toBeDisabled();
  });
});
