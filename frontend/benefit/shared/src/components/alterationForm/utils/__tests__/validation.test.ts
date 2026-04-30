import { ALTERATION_TYPE, VALIDATION_MESSAGE_KEYS } from 'benefit-shared/constants';
import { Application } from 'benefit-shared/types/application';
import i18n from 'i18next';
import { TFunction } from 'i18next';

import { getValidationSchema } from '../validation';

const t = i18n.getFixedT('fi', 'common') as unknown as TFunction;

const baseApplication = {
  startDate: '2024-01-01',
  endDate: '2024-06-30',
} as Application;

const validBase = {
  application: 'app-id',
  alterationType: ALTERATION_TYPE.TERMINATION,
  endDate: '2024-03-01',
  resumeDate: null,
  reason: '',
  contactPersonName: 'John Doe',
  useEinvoice: false,
  einvoiceProviderName: '',
  einvoiceProviderIdentifier: '',
  einvoiceAddress: '',
};

const schema = getValidationSchema(baseApplication, t);

describe('getValidationSchema', () => {

  describe('application field', () => {
    it('is required', async () => {
      await expect(
        schema.validateAt('application', { ...validBase, application: '' })
      ).rejects.toThrow(t(VALIDATION_MESSAGE_KEYS.REQUIRED));
    });

    it('passes with a value', async () => {
      await expect(
        schema.validateAt('application', validBase)
      ).resolves.toBeDefined();
    });
  });

  describe('alterationType field', () => {
    it('is required', async () => {
      await expect(
        schema.validateAt('alterationType', { ...validBase, alterationType: undefined })
      ).rejects.toThrow(t(VALIDATION_MESSAGE_KEYS.REQUIRED));
    });

    it('rejects unknown type', async () => {
      await expect(
        schema.validateAt('alterationType', { ...validBase, alterationType: 'unknown' })
      ).rejects.toBeDefined();
    });

    it('accepts termination', async () => {
      await expect(
        schema.validateAt('alterationType', { ...validBase, alterationType: ALTERATION_TYPE.TERMINATION })
      ).resolves.toBeDefined();
    });

    it('accepts suspension', async () => {
      await expect(
        schema.validateAt('alterationType', { ...validBase, alterationType: ALTERATION_TYPE.SUSPENSION })
      ).resolves.toBeDefined();
    });
  });

  describe('endDate field', () => {
    it('is required', async () => {
      await expect(
        schema.validateAt('endDate', { ...validBase, endDate: null })
      ).rejects.toThrow(t(VALIDATION_MESSAGE_KEYS.REQUIRED));
    });

    it('rejects date before application startDate', async () => {
      await expect(
        schema.validateAt('endDate', { ...validBase, endDate: '2023-12-31' })
      ).rejects.toThrow(t('form.validation.date.min', { min: '1.1.2024' }));
    });

    it('rejects date after application endDate', async () => {
      await expect(
        schema.validateAt('endDate', { ...validBase, endDate: '2024-07-01' })
      ).rejects.toThrow(t('form.validation.date.max', { max: '30.6.2024' }));
    });

    it('accepts date on application startDate', async () => {
      await expect(
        schema.validateAt('endDate', { ...validBase, endDate: '2024-01-01' })
      ).resolves.toBeDefined();
    });

    it('accepts date on application endDate', async () => {
      await expect(
        schema.validateAt('endDate', { ...validBase, endDate: '2024-06-30' })
      ).resolves.toBeDefined();
    });

    it('accepts date within application range', async () => {
      await expect(
        schema.validateAt('endDate', validBase)
      ).resolves.toBeDefined();
    });
  });

  describe('resumeDate field', () => {
    it('is not required for termination', async () => {
      await expect(
        schema.validateAt('resumeDate', { ...validBase, alterationType: ALTERATION_TYPE.TERMINATION, resumeDate: null })
      ).resolves.toBeDefined();
    });

    it('is required for suspension', async () => {
      await expect(
        schema.validateAt('resumeDate', {
          ...validBase,
          alterationType: ALTERATION_TYPE.SUSPENSION,
          resumeDate: null,
        })
      ).rejects.toThrow(t(VALIDATION_MESSAGE_KEYS.REQUIRED));
    });

    it('rejects resumeDate before application startDate for suspension', async () => {
      await expect(
        schema.validateAt('resumeDate', {
          ...validBase,
          alterationType: ALTERATION_TYPE.SUSPENSION,
          endDate: '2024-03-01',
          resumeDate: '2023-12-31',
        })
      ).rejects.toThrow(t('form.validation.date.min', { min: '1.1.2024' }));
    });

    it('rejects resumeDate after application endDate for suspension', async () => {
      await expect(
        schema.validateAt('resumeDate', {
          ...validBase,
          alterationType: ALTERATION_TYPE.SUSPENSION,
          endDate: '2024-03-01',
          resumeDate: '2024-07-01',
        })
      ).rejects.toThrow(t('form.validation.date.max', { max: '30.6.2024' }));
    });

    it('rejects resumeDate on or before endDate for suspension', async () => {
      await expect(
        schema.validateAt('resumeDate', {
          ...validBase,
          alterationType: ALTERATION_TYPE.SUSPENSION,
          endDate: '2024-03-01',
          resumeDate: '2024-03-01',
        })
      ).rejects.toThrow(t(
        'common:applications.alterations.new.validation.resumeDateBeforeEndDate'
      ));
    });

    it('accepts resumeDate after endDate within application range for suspension', async () => {
      await expect(
        schema.validateAt('resumeDate', {
          ...validBase,
          alterationType: ALTERATION_TYPE.SUSPENSION,
          endDate: '2024-03-01',
          resumeDate: '2024-03-02',
        })
      ).resolves.toBeDefined();
    });
  });

  describe('contactPersonName field', () => {
    it('is required', async () => {
      await expect(
        schema.validateAt('contactPersonName', { ...validBase, contactPersonName: '' })
      ).rejects.toThrow(t(VALIDATION_MESSAGE_KEYS.REQUIRED));
    });

    it('passes with a value', async () => {
      await expect(
        schema.validateAt('contactPersonName', validBase)
      ).resolves.toBeDefined();
    });
  });

  describe('einvoice fields', () => {
    it('are not required when useEinvoice is false', async () => {
      await expect(
        schema.validate({ ...validBase, useEinvoice: false })
      ).resolves.toBeDefined();
    });

    it('einvoiceProviderName is required when useEinvoice is true', async () => {
      await expect(
        schema.validateAt('einvoiceProviderName', {
          ...validBase,
          useEinvoice: true,
          einvoiceProviderName: '',
        })
      ).rejects.toThrow(t(VALIDATION_MESSAGE_KEYS.REQUIRED));
    });

    it('einvoiceProviderIdentifier is required when useEinvoice is true', async () => {
      await expect(
        schema.validateAt('einvoiceProviderIdentifier', {
          ...validBase,
          useEinvoice: true,
          einvoiceProviderIdentifier: '',
        })
      ).rejects.toThrow(t(VALIDATION_MESSAGE_KEYS.REQUIRED));
    });

    it('einvoiceAddress is required when useEinvoice is true', async () => {
      await expect(
        schema.validateAt('einvoiceAddress', {
          ...validBase,
          useEinvoice: true,
          einvoiceAddress: '',
        })
      ).rejects.toThrow(t(VALIDATION_MESSAGE_KEYS.REQUIRED));
    });

    it('passes all einvoice fields when useEinvoice is true and all provided', async () => {
      await expect(
        schema.validate({
          ...validBase,
          useEinvoice: true,
          einvoiceProviderName: 'Provider',
          einvoiceProviderIdentifier: '003712345678',
          einvoiceAddress: '003712345678',
        })
      ).resolves.toBeDefined();
    });
  });
});
