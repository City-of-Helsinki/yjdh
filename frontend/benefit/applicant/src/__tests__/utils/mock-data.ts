import { ALTERATION_STATE, ALTERATION_TYPE } from 'benefit-shared/constants';
import {
  ApplicantConsent,
  Application,
  ApplicationAlteration,
} from 'benefit-shared/types/application';
import { BenefitAttachment } from 'shared/types/attachment';

type ApplicationOverrides = Omit<Partial<Application>, 'company'> & {
  company?: Partial<NonNullable<Application['company']>>;
};

export const createMockApplication = (
  overrides: ApplicationOverrides = {}
): Application => {
  const defaultApplication = {
    id: 'application-id',
    applicationNumber: '2026-0001',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    company: {
      name: 'Test Company Oy',
      streetAddress: 'Testikatu 1',
      postcode: '00100',
      city: 'Helsinki',
    },
    companyContactPersonFirstName: 'John',
    companyContactPersonLastName: 'Doe',
  } as unknown as Application;

  return {
    ...defaultApplication,
    ...overrides,
    company: {
      ...defaultApplication.company,
      ...overrides.company,
    },
  } as Application;
};

export const createMockAlteration = (
  overrides: Partial<ApplicationAlteration> = {}
): ApplicationAlteration => {
  const defaultAlteration: ApplicationAlteration = {
    id: 1,
    application: 'app-id',
    alterationType: ALTERATION_TYPE.SUSPENSION,
    endDate: '2024-06-30',
    resumeDate: '2024-07-15',
    state: ALTERATION_STATE.RECEIVED,
    contactPersonName: 'Maija Meikäläinen',
    useEinvoice: false,
  };

  return {
    ...defaultAlteration,
    ...overrides,
  };
};

export const createMockApplicantConsent = (
  overrides: Partial<ApplicantConsent> = {}
): ApplicantConsent => {
  const defaultConsent: ApplicantConsent = {
    id: 'consent-1',
    textFi: 'Suostumus',
    textEn: 'Consent',
    textSv: 'Samtycke',
  };

  return {
    ...defaultConsent,
    ...overrides,
  };
};

export const createMockBenefitAttachment = (
  overrides: Partial<BenefitAttachment> = {}
): BenefitAttachment => {
  const defaultAttachment: BenefitAttachment = {
    id: 'att-1',
    application: 'app-1',
    attachmentType: 'employee_consent',
    attachmentFile: '/files/employee-consent.pdf',
    attachmentFileName: 'employee-consent.pdf',
    contentType: 'application/pdf',
  };

  return {
    ...defaultAttachment,
    ...overrides,
  };
};
