import { screen } from '@testing-library/react';
import {
  createMockApplicantConsent,
  createMockApplication,
} from 'benefit/applicant/__tests__/utils/mock-data';
import renderComponent from 'benefit/applicant/__tests__/utils/render-component';
import ConsentViewer from 'benefit/applicant/components/applications/forms/application/consentViewer/ConsentViewer';
import { useConsentViewer } from 'benefit/applicant/components/applications/forms/application/consentViewer/useConsentViewer';
import { ATTACHMENT_TYPES } from 'benefit-shared/constants';
import { Application } from 'benefit-shared/types/application';
import React from 'react';

import i18n from '../../../../../../../test/i18n/i18n-test';

jest.mock(
  'benefit/applicant/components/applications/forms/application/consentViewer/useConsentViewer'
);

const mockUseConsentViewer = useConsentViewer as jest.Mock;

const baseApplication = createMockApplication({
  applicantTermsApproval: {
    id: 'approval-1',
    approvedAt: '2026-01-02T09:00:00Z',
    approvedBy: 'user-1',
    terms: {
      id: 'terms-1',
      effectiveFrom: '2026-01-01',
      termsType: ATTACHMENT_TYPES.EMPLOYEE_CONSENT,
      termsPdfFi: 'https://example.com/terms-fi.pdf',
      applicantConsents: [
        createMockApplicantConsent({
          id: 'consent-1',
          textFi: 'Ensimmäinen suostumus',
        }),
        createMockApplicantConsent({
          id: 'consent-2',
          textFi: 'Toinen suostumus',
        }),
      ],
    },
  },
});

const renderConsentViewer = (
  data?: Application
): ReturnType<typeof renderComponent> =>
  renderComponent(<ConsentViewer data={data as Application} />);

describe('ConsentViewer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseConsentViewer.mockReturnValue({
      t: i18n.t.bind(i18n),
      textLocale: 'Fi',
      cbPrefix: 'application_conset_read-only',
    });
  });

  it('renders nothing when data is not provided', () => {
    renderConsentViewer();

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });

  it('renders terms pdf link with translated label and href', () => {
    renderConsentViewer(baseApplication);

    const termsLink = screen.getByRole('link', {
      name: /ehdot\.pdf\.\s*avautuu uudella verkkosivulla/i,
    });
    expect(termsLink).toBeInTheDocument();
    expect(termsLink).toHaveAttribute(
      'href',
      'https://example.com/terms-fi.pdf'
    );
  });

  it('renders one disabled checked checkbox for each applicant consent', () => {
    renderConsentViewer(baseApplication);

    const firstConsent = screen.getByRole('checkbox', {
      name: 'Ensimmäinen suostumus',
    });
    const secondConsent = screen.getByRole('checkbox', {
      name: 'Toinen suostumus',
    });

    expect(firstConsent).toBeChecked();
    expect(firstConsent).toBeDisabled();
    expect(secondConsent).toBeChecked();
    expect(secondConsent).toBeDisabled();
  });

  it('uses the consent viewer checkbox id prefix from the hook', () => {
    renderConsentViewer(baseApplication);

    expect(screen.getByLabelText('Ensimmäinen suostumus')).toHaveAttribute(
      'id',
      'application_conset_read-only_consent-1'
    );
    expect(screen.getByLabelText('Toinen suostumus')).toHaveAttribute(
      'id',
      'application_conset_read-only_consent-2'
    );
  });
});
