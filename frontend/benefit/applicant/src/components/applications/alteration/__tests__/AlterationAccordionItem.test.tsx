import { RenderResult, screen, waitFor } from '@testing-library/react';
import {
  createMockAlteration,
  createMockApplication,
} from 'benefit/applicant/__tests__/utils/mock-data';
import renderComponent from 'benefit/applicant/__tests__/utils/render-component';
import { setupUserAndRender } from 'benefit/applicant/__tests__/utils/user-render-helper';
import useDeleteApplicationAlterationQuery from 'benefit/applicant/hooks/useDeleteApplicationAlterationQuery';
import { ALTERATION_STATE, ALTERATION_TYPE } from 'benefit-shared/constants';
import {
  Application,
  ApplicationAlteration,
} from 'benefit-shared/types/application';
import React from 'react';
import hdsToast from 'shared/components/toast/Toast';

import AlterationAccordionItem from '../AlterationAccordionItem';

jest.mock('next/router', () => jest.requireActual('next-router-mock'));
jest.mock('benefit/applicant/hooks/useLocale', () => jest.fn(() => 'fi'));
jest.mock('benefit/applicant/hooks/useDeleteApplicationAlterationQuery');
jest.mock('shared/components/toast/Toast');

const baseAlteration: ApplicationAlteration = createMockAlteration({
  application: 'app-id',
});

const baseApplication = createMockApplication({
  id: 'app-id',
  company: {
    name: 'Test Company Oy',
    streetAddress: 'Testikatu 1',
    postcode: '00100',
    city: 'Helsinki',
  },
});

const getComponent = (
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
  user: ReturnType<typeof setupUserAndRender>
): Promise<void> => {
  // The accordion is collapsed by default; expand it to access content buttons
  const toggle = screen.getByRole('button', { expanded: false });
  await user.click(toggle);
};

const getDeleteButton = (): HTMLElement =>
  screen.getByRole('button', {
    name: /poista/i,
  });

const queryDeleteButton = (): HTMLElement | null =>
  screen.queryByRole('button', {
    name: /poista/i,
  });

describe('AlterationAccordionItem', () => {
  const mockMutate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useDeleteApplicationAlterationQuery as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      status: 'idle',
    });
  });

  it('renders without accessibility violations', async () => {
    const { container } = getComponent();
    const { axe } = await import('jest-axe');
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('shows delete button when state is RECEIVED', async () => {
    const user = setupUserAndRender(() =>
      getComponent({ ...baseAlteration, state: ALTERATION_STATE.RECEIVED })
    );
    await openAccordion(user);

    expect(getDeleteButton()).toBeInTheDocument();
  });

  it('does not show delete button when state is HANDLED', async () => {
    const user = setupUserAndRender(() =>
      getComponent({
        ...baseAlteration,
        state: ALTERATION_STATE.HANDLED,
        recoveryStartDate: '2024-06-01',
        recoveryEndDate: '2024-06-30',
        recoveryAmount: '1200.00',
      })
    );
    await openAccordion(user);

    expect(queryDeleteButton()).not.toBeInTheDocument();
  });

  it('does not show delete button when state is CANCELLED', async () => {
    const user = setupUserAndRender(() =>
      getComponent({ ...baseAlteration, state: ALTERATION_STATE.CANCELLED })
    );
    await openAccordion(user);

    expect(queryDeleteButton()).not.toBeInTheDocument();
  });

  it('shows recovery details when state is HANDLED', async () => {
    const user = setupUserAndRender(() =>
      getComponent({
        ...baseAlteration,
        state: ALTERATION_STATE.HANDLED,
        recoveryStartDate: '2024-06-01',
        recoveryEndDate: '2024-06-30',
        recoveryAmount: '1200.00',
      })
    );

    await openAccordion(user);

    expect(await screen.findByText(/1\s*200/)).toBeInTheDocument();
    expect(
      await screen.findByText('Aika, jolta tukea laskutettiin takaisin')
    ).toBeInTheDocument();
    expect(await screen.findByText(/1\.6\.2024/)).toBeInTheDocument();
  });

  it('shows company address when useEinvoice is false', async () => {
    const user = setupUserAndRender(() =>
      getComponent({ ...baseAlteration, useEinvoice: false })
    );

    await openAccordion(user);

    expect(await screen.findByText(/Testikatu 1/)).toBeInTheDocument();
  });

  it('shows einvoice fields when useEinvoice is true', async () => {
    const user = setupUserAndRender(() =>
      getComponent({
        ...baseAlteration,
        useEinvoice: true,
        einvoiceProviderName: 'Maventa',
        einvoiceProviderIdentifier: '003712345678',
        einvoiceAddress: 'einvoice@example.com',
      })
    );

    await openAccordion(user);

    expect(await screen.findByText('Maventa')).toBeInTheDocument();
    expect(await screen.findByText('003712345678')).toBeInTheDocument();
    expect(await screen.findByText('einvoice@example.com')).toBeInTheDocument();
  });

  it('shows contact person name', async () => {
    const user = setupUserAndRender(() => getComponent());

    await openAccordion(user);

    expect(await screen.findByText('Maija Meikäläinen')).toBeInTheDocument();
  });

  it('opens delete modal when delete button is clicked', async () => {
    const user = setupUserAndRender(() =>
      getComponent({ ...baseAlteration, state: ALTERATION_STATE.RECEIVED })
    );

    await openAccordion(user);
    await user.click(getDeleteButton());

    expect(
      await screen.findByRole('button', { name: /peruuta/i })
    ).toBeInTheDocument();
  });

  it('closes delete modal when cancel is clicked', async () => {
    const user = setupUserAndRender(() =>
      getComponent({ ...baseAlteration, state: ALTERATION_STATE.RECEIVED })
    );

    await openAccordion(user);
    await user.click(getDeleteButton());

    const cancelButton = await screen.findByRole('button', {
      name: /peruuta/i,
    });
    await user.click(cancelButton);

    await waitFor(() => {
      expect(
        screen.queryByRole('button', { name: /peruuta/i })
      ).not.toBeInTheDocument();
    });
  });

  it('calls delete mutation with ids and shows success toast after successful delete', async () => {
    const user = setupUserAndRender(() =>
      getComponent({ ...baseAlteration, state: ALTERATION_STATE.RECEIVED })
    );

    await openAccordion(user);
    await user.click(getDeleteButton());

    await screen.findByRole('button', { name: /peruuta/i });

    const deleteButtons = screen.getAllByRole('button', { name: /poista/i });
    await user.click(deleteButtons.at(-1));

    expect(mockMutate).toHaveBeenCalledWith(
      { id: String(baseAlteration.id), applicationId: baseApplication.id },
      expect.objectContaining({
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      })
    );

    const callbacks = mockMutate.mock.calls[0][1];
    callbacks.onSuccess();

    await waitFor(() => {
      expect(
        screen.queryByRole('button', { name: /peruuta/i })
      ).not.toBeInTheDocument();
    });

    expect(hdsToast).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'success',
        labelText: expect.any(String),
        text: expect.any(String),
      })
    );
  });

  it('shows error toast with generic message when delete fails with html response', async () => {
    const user = setupUserAndRender(() =>
      getComponent({ ...baseAlteration, state: ALTERATION_STATE.RECEIVED })
    );

    await openAccordion(user);
    await user.click(getDeleteButton());

    await screen.findByRole('button', { name: /peruuta/i });

    const deleteButtons = screen.getAllByRole('button', { name: /poista/i });
    await user.click(deleteButtons.at(-1));

    const callbacks = mockMutate.mock.calls[0][1];
    callbacks.onError({ response: { data: '<html>error</html>' } });

    await waitFor(() => {
      expect(hdsToast).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error',
          labelText: expect.any(String),
          text: expect.any(String),
        })
      );
    });
  });

  it('renders TERMINATION type alteration', async () => {
    const user = setupUserAndRender(() =>
      getComponent({
        ...baseAlteration,
        alterationType: ALTERATION_TYPE.TERMINATION,
        resumeDate: undefined,
      })
    );

    await openAccordion(user);

    expect(screen.getByText('Maija Meikäläinen')).toBeInTheDocument();
  });
});
