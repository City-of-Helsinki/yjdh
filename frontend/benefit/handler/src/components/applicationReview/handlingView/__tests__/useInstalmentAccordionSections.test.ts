/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ALTERATION_STATE,
  INSTALMENT_STATUSES,
} from 'benefit-shared/constants';
import { Application } from 'benefit-shared/types/application';

import useInstalmentAccordionSections from '../useInstalmentAccordionSections';

const buildCalculation = (overrides?: Partial<Record<string, any>>): any => ({
  calculatedBenefitAmount: '1200',
  ...overrides,
});

const buildApplication = (overrides?: Partial<Application>): Application =>
  ({
    id: 'app-1',
    status: 'received',
    applicationNumber: 'APP-001',
    companyName: 'Test Company',
    calculation: buildCalculation(),
    secondInstalment: undefined,
    alterations: [],
    ...overrides,
  } as unknown as Application);

describe('useInstalmentAccordionSections', () => {
  it('calculates first instalment when there is no second instalment', () => {
    const application = buildApplication({
      calculation: buildCalculation({ calculatedBenefitAmount: '1000' }),
      secondInstalment: undefined,
    });

    const result = useInstalmentAccordionSections(application);

    expect(result.amounts.firstInstalment).toBe(1000);
    expect(result.amounts.secondInstalment).toBe(0);
    expect(result.amounts.total).toBe(1000);
  });

  it('calculates first instalment as remainder when there is a second instalment', () => {
    const application = buildApplication({
      calculation: buildCalculation({ calculatedBenefitAmount: '1200' }),
      secondInstalment: {
        id: 'inst-1',
        instalmentNumber: 2,
        amount: 500,
        dueDate: '2026-12-31',
        amountAfterRecoveries: 450,
        status: INSTALMENT_STATUSES.COMPLETED,
      } as any,
    });

    const result = useInstalmentAccordionSections(application);

    expect(result.amounts.firstInstalment).toBe(700); // 1200 - 500
    expect(result.amounts.secondInstalment).toBe(450);
    expect(result.amounts.total).toBe(1150); // 700 + 450
  });

  it('handles zero benefit amount', () => {
    const application = buildApplication({
      calculation: buildCalculation({ calculatedBenefitAmount: '0' }),
      secondInstalment: undefined,
    });

    const result = useInstalmentAccordionSections(application);

    expect(result.amounts.firstInstalment).toBe(0);
    expect(result.amounts.total).toBe(0);
  });

  it('handles negative first instalment (clamps to zero)', () => {
    const application = buildApplication({
      calculation: buildCalculation({ calculatedBenefitAmount: '300' }),
      secondInstalment: {
        id: 'inst-2',
        instalmentNumber: 2,
        amount: 500, // Greater than benefit amount
        dueDate: '2026-12-31',
        amountAfterRecoveries: 300,
        status: INSTALMENT_STATUSES.PENDING,
      } as any,
    });

    const result = useInstalmentAccordionSections(application);

    expect(result.amounts.firstInstalment).toBe(0); // Math.max(0, 300 - 500)
    expect(result.amounts.secondInstalment).toBe(300);
  });

  it('returns true for areInstalmentsPaid when second instalment status is COMPLETED', () => {
    const application = buildApplication({
      secondInstalment: {
        id: 'inst-3',
        instalmentNumber: 2,
        amount: 500,
        dueDate: '2026-12-31',
        amountAfterRecoveries: 450,
        status: INSTALMENT_STATUSES.COMPLETED,
      } as any,
    });

    const result = useInstalmentAccordionSections(application);

    expect(result.areInstalmentsPaid).toBe(true);
  });

  it('returns true for areInstalmentsPaid when there is no second instalment', () => {
    const application = buildApplication({
      secondInstalment: undefined,
    });

    const result = useInstalmentAccordionSections(application);

    expect(result.areInstalmentsPaid).toBe(true);
  });

  it('returns false for areInstalmentsPaid when second instalment status is PENDING', () => {
    const application = buildApplication({
      secondInstalment: {
        id: 'inst-4',
        instalmentNumber: 2,
        amount: 500,
        dueDate: '2026-12-31',
        amountAfterRecoveries: 450,
        status: INSTALMENT_STATUSES.PENDING,
      } as any,
    });

    const result = useInstalmentAccordionSections(application);

    expect(result.areInstalmentsPaid).toBe(false);
  });

  it('detects when second instalment is reduced', () => {
    const application = buildApplication({
      calculation: buildCalculation({ calculatedBenefitAmount: '1200' }),
      secondInstalment: {
        id: 'inst-5',
        instalmentNumber: 2,
        amount: 600, // Max amount
        dueDate: '2026-12-31',
        amountAfterRecoveries: 400, // Reduced after recoveries
        status: INSTALMENT_STATUSES.COMPLETED,
      } as any,
    });

    const result = useInstalmentAccordionSections(application);

    expect(result.isSecondInstalmentReduced).toBe(true);
  });

  it('detects when second instalment is not reduced', () => {
    const application = buildApplication({
      calculation: buildCalculation({ calculatedBenefitAmount: '1200' }),
      secondInstalment: {
        id: 'inst-6',
        instalmentNumber: 2,
        amount: 600,
        dueDate: '2026-12-31',
        amountAfterRecoveries: 600, // Same as max amount
        status: INSTALMENT_STATUSES.COMPLETED,
      } as any,
    });

    const result = useInstalmentAccordionSections(application);

    expect(result.isSecondInstalmentReduced).toBe(false);
  });

  it('calculates alterations sum for HANDLED alterations only', () => {
    const application = buildApplication({
      calculation: buildCalculation({ calculatedBenefitAmount: '1500' }),
      alterations: [
        {
          state: ALTERATION_STATE.HANDLED,
          recoveryAmount: '100',
        },
        {
          state: ALTERATION_STATE.HANDLED,
          recoveryAmount: '50',
        },
        {
          state: ALTERATION_STATE.CANCELLED,
          recoveryAmount: '200',
        },
      ] as any,
    });

    const result = useInstalmentAccordionSections(application);

    expect(result.amounts.alterations).toBe(150); // 100 + 50, not 200
  });

  it('handles empty alterations array', () => {
    const application = buildApplication({
      calculation: buildCalculation({ calculatedBenefitAmount: '1500' }),
      alterations: [],
    });

    const result = useInstalmentAccordionSections(application);

    expect(result.amounts.alterations).toBe(0);
  });

  it('handles null or undefined recoveryAmount in alterations', () => {
    const application = buildApplication({
      calculation: buildCalculation({ calculatedBenefitAmount: '1500' }),
      alterations: [
        {
          state: ALTERATION_STATE.HANDLED,
          recoveryAmount: undefined,
        },
        {
          state: ALTERATION_STATE.HANDLED,
          recoveryAmount: '50',
        },
      ] as any,
    });

    const result = useInstalmentAccordionSections(application);

    expect(result.amounts.alterations).toBe(50);
  });

  it('calculates totalAfterRecoveries correctly', () => {
    const application = buildApplication({
      calculation: buildCalculation({ calculatedBenefitAmount: '1000' }),
      alterations: [
        {
          state: ALTERATION_STATE.HANDLED,
          recoveryAmount: '150',
        },
      ] as any,
    });

    const result = useInstalmentAccordionSections(application);

    expect(result.amounts.totalAfterRecoveries).toBe(850); // 1000 - 150
  });

  it('handles floating point amounts correctly', () => {
    const application = buildApplication({
      calculation: buildCalculation({ calculatedBenefitAmount: '1234.56' }),
      secondInstalment: {
        id: 'inst-10',
        instalmentNumber: 2,
        amount: 600.5,
        dueDate: '2026-12-31',
        amountAfterRecoveries: 600.75,
        status: INSTALMENT_STATUSES.COMPLETED,
      } as any,
    });

    const result = useInstalmentAccordionSections(application);

    expect(result.amounts.firstInstalment).toBe(633.5);
    expect(result.amounts.secondInstalment).toBe(600.75);
    expect(result.amounts.total).toBe(1234.25);
  });

  it('handles missing calculation object', () => {
    const application = buildApplication({
      calculation: undefined,
    });

    const result = useInstalmentAccordionSections(application);

    expect(result.amounts.firstInstalment).toBe(0);
    expect(result.amounts.total).toBe(0);
  });

  it('handles missing secondInstalment.amountAfterRecoveries', () => {
    const application = buildApplication({
      calculation: buildCalculation({ calculatedBenefitAmount: '1000' }),
      secondInstalment: {
        id: 'inst-11',
        instalmentNumber: 2,
        amount: 400,
        dueDate: '2026-12-31',
        amountAfterRecoveries: 0,
        status: INSTALMENT_STATUSES.PENDING,
      } as any,
    });

    const result = useInstalmentAccordionSections(application);

    expect(result.amounts.secondInstalment).toBe(0);
  });

  it('returns all required properties', () => {
    const application = buildApplication();

    const result = useInstalmentAccordionSections(application);

    expect(result).toHaveProperty('amounts');
    expect(result).toHaveProperty('areInstalmentsPaid');
    expect(result).toHaveProperty('isSecondInstalmentReduced');
    expect(result.amounts).toHaveProperty('firstInstalment');
    expect(result.amounts).toHaveProperty('secondInstalment');
    expect(result.amounts).toHaveProperty('secondInstalmentMax');
    expect(result.amounts).toHaveProperty('total');
    expect(result.amounts).toHaveProperty('totalAfterRecoveries');
    expect(result.amounts).toHaveProperty('alterations');
  });

  it('handles multiple alterations with various states', () => {
    const application = buildApplication({
      calculation: buildCalculation({ calculatedBenefitAmount: '2000' }),
      alterations: [
        {
          state: ALTERATION_STATE.HANDLED,
          recoveryAmount: '200',
        },
        {
          state: ALTERATION_STATE.HANDLED,
          recoveryAmount: '100',
        },
        {
          state: ALTERATION_STATE.OPENED,
          recoveryAmount: '500',
        },
        {
          state: ALTERATION_STATE.CANCELLED,
          recoveryAmount: '300',
        },
      ] as any,
    });

    const result = useInstalmentAccordionSections(application);

    expect(result.amounts.alterations).toBe(300); // Only HANDLED: 200 + 100
    expect(result.amounts.totalAfterRecoveries).toBe(1700); // 2000 - 300
  });

  it('maintains consistency between total and sum of instalments', () => {
    const application = buildApplication({
      calculation: buildCalculation({ calculatedBenefitAmount: '1500' }),
      secondInstalment: {
        id: 'inst-12',
        instalmentNumber: 2,
        amount: 700,
        dueDate: '2026-12-31',
        amountAfterRecoveries: 650,
        status: INSTALMENT_STATUSES.COMPLETED,
      } as any,
    });

    const result = useInstalmentAccordionSections(application);

    expect(result.amounts.total).toBe(
      result.amounts.firstInstalment + result.amounts.secondInstalment
    );
  });
});
/* eslint-enable @typescript-eslint/no-explicit-any */
