import { fireEvent,RenderResult, screen } from '@testing-library/react';
import renderComponent from 'benefit/applicant/__tests__/utils/render-component';
import {
  ALTERATION_STATE,
  ALTERATION_TYPE,
} from 'benefit-shared/constants';
import {
  Application,
  ApplicationAlteration,
} from 'benefit-shared/types/application';
import React from 'react';

import AlterationAccordionItem from '../AlterationAccordionItem';

function mockDeleteQuery(): { mutate: jest.Mock; status: string } {
  return {
    mutate: jest.fn(),
    status: 'idle',
  };
}

jest.mock('next/router', () => jest.requireActual('next-router-mock'));
jest.mock('benefit/applicant/hooks/useLocale', () => jest.fn(() => 'fi'));
jest.mock(
  'benefit/applicant/hooks/useDeleteApplicationAlterationQuery',
  () => mockDeleteQuery
);

const baseAlteration: ApplicationAlteration = {
  id: 1,
  application: 'app-id',
  alterationType: ALTERATION_TYPE.SUSPENSION,
  endDate: '2024-06-30',
  resumeDate: '2024-07-15',
  state: ALTERATION_STATE.RECEIVED,
  contactPersonName: 'Maija Meikäläinen',
  useEinvoice: false,
};

const baseApplication = {
  id: 'app-id',
  company: {
    name: 'Test Company Oy',
    streetAddress: 'Testikatu 1',
    postcode: '00100',
    city: 'Helsinki',
  },
} as unknown as Application;

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

const openAccordion = (): void => {
  // The accordion is collapsed by default; expand it to access content buttons
  const toggle = screen.getByRole('button', { expanded: false });
  fireEvent.click(toggle);
};

describe('AlterationAccordionItem', () => {
  it('renders without accessibility violations', async () => {
    const { container } = getComponent();
    const { axe } = await import('jest-axe');
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('shows delete button when state is RECEIVED', () => {
    getComponent({ ...baseAlteration, state: ALTERATION_STATE.RECEIVED });
    openAccordion();
    expect(
      screen.getByRole('button', {
        name: /poista/i,
      })
    ).toBeInTheDocument();
  });

  it('does not show delete button when state is HANDLED', () => {
    getComponent({
      ...baseAlteration,
      state: ALTERATION_STATE.HANDLED,
      recoveryStartDate: '2024-06-01',
      recoveryEndDate: '2024-06-30',
      recoveryAmount: '1200.00',
    });
    openAccordion();
    expect(
      screen.queryByRole('button', { name: /poista/i })
    ).not.toBeInTheDocument();
  });

  it('does not show delete button when state is CANCELLED', () => {
    getComponent({ ...baseAlteration, state: ALTERATION_STATE.CANCELLED });
    openAccordion();
    expect(
      screen.queryByRole('button', { name: /poista/i })
    ).not.toBeInTheDocument();
  });

  it('shows recovery details when state is HANDLED', () => {
    getComponent({
      ...baseAlteration,
      state: ALTERATION_STATE.HANDLED,
      recoveryStartDate: '2024-06-01',
      recoveryEndDate: '2024-06-30',
      recoveryAmount: '1200.00',
    });
    // Recovery amount and period fields should be present
    expect(
      screen.getByText(/1\s*200/)
    ).toBeInTheDocument();
  });

  it('shows company address when useEinvoice is false', () => {
    getComponent({ ...baseAlteration, useEinvoice: false });
    expect(screen.getByText(/Testikatu 1/)).toBeInTheDocument();
  });

  it('shows einvoice fields when useEinvoice is true', () => {
    getComponent({
      ...baseAlteration,
      useEinvoice: true,
      einvoiceProviderName: 'Maventa',
      einvoiceProviderIdentifier: '003712345678',
      einvoiceAddress: 'einvoice@example.com',
    });
    expect(screen.getByText('Maventa')).toBeInTheDocument();
    expect(screen.getByText('003712345678')).toBeInTheDocument();
  });

  it('shows contact person name', () => {
    getComponent();
    expect(screen.getByText('Maija Meikäläinen')).toBeInTheDocument();
  });

  it('opens delete modal when delete button is clicked', () => {
    getComponent({ ...baseAlteration, state: ALTERATION_STATE.RECEIVED });
    openAccordion();
    const deleteButton = screen.getByRole('button', { name: /poista/i });
    fireEvent.click(deleteButton);
    // Modal should appear — check for modal dialog
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('closes delete modal when cancel is clicked', () => {
    getComponent({ ...baseAlteration, state: ALTERATION_STATE.RECEIVED });
    openAccordion();
    fireEvent.click(screen.getByRole('button', { name: /poista/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    const closeButton = screen.getByRole('button', { name: /peruuta/i });
    fireEvent.click(closeButton);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders TERMINATION type alteration', () => {
    getComponent({
      ...baseAlteration,
      alterationType: ALTERATION_TYPE.TERMINATION,
      resumeDate: undefined,
    });
    // Component should render without errors for termination type
    expect(screen.getByText('Maija Meikäläinen')).toBeInTheDocument();
  });
});
