import {
  ALTERATION_STATE,
  ALTERATION_TYPE,
  APPLICATION_STATUSES,
} from 'benefit-shared/constants';
import {
  Application,
  ApplicationAlteration,
} from 'benefit-shared/types/application';

export const createAlterationApplication = (
  overrides: Partial<Application> = {}
): Application =>
  ({
    id: 'app-id',
    applicationNumber: 42,
    status: APPLICATION_STATUSES.ACCEPTED,
    company: {
      name: 'Yritys Oy',
      businessId: '1234567-8',
      streetAddress: 'Testikatu 1',
      postcode: '00100',
      city: 'Helsinki',
    },
    ...overrides,
  } as Application);

export const createAlteration = (
  overrides: Partial<ApplicationAlteration> = {}
): ApplicationAlteration =>
  ({
    id: 1,
    application: 'app-id',
    alterationType: ALTERATION_TYPE.SUSPENSION,
    state: ALTERATION_STATE.RECEIVED,
    endDate: '2024-06-30',
    resumeDate: '2024-07-15',
    contactPersonName: 'Maija Meikalainen',
    useEinvoice: false,
    reason: 'Temporary suspension',
    ...overrides,
  } as ApplicationAlteration);

export const createHandledAlteration = (
  overrides: Partial<ApplicationAlteration> = {}
): ApplicationAlteration =>
  createAlteration({
    state: ALTERATION_STATE.HANDLED,
    handledAt: '2024-07-01',
    handledBy: { firstName: 'Helmi', lastName: 'Handler' } as never,
    isRecoverable: false,
    recoveryJustification: 'No recovery needed',
    ...overrides,
  });
