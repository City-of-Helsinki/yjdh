import { APPLICATION_START_DATE } from 'benefit-shared/constants';
import {
  getDateFromDateString,
  getMaxEndDate,
  getMinEndDate,
  validateDateIsFromCurrentYearOnwards,
  validateDateWithinMonths,
  validateFinnishDatePattern,
  validateIsAfterOrOnDate,
  validateIsBeforeOrOnDate,
  validateIsTodayOrPastDate,
} from 'benefit-shared/utils/dates';
import addMonths from 'date-fns/addMonths';
import subDays from 'date-fns/subDays';

const expectDateParts = (
  date: Date | null | undefined,
  year: number,
  month: number,
  day: number
): void => {
  expect(date).not.toBeNull();
  expect(date).toBeDefined();
  expect(date?.getFullYear()).toBe(year);
  expect((date?.getMonth() ?? -1) + 1).toBe(month);
  expect(date?.getDate()).toBe(day);
};

describe('dates utils', () => {
  describe('getMinEndDate', () => {
    it('returns one month minus one day from start date by default', () => {
      expectDateParts(getMinEndDate('2024-02-15'), 2024, 3, 14);
    });

    it('returns the parsed start date when no restriction is enabled', () => {
      expectDateParts(getMinEndDate('2024-02-15', true), 2024, 2, 15);
    });

    it('falls back to application start date when start date is missing', () => {
      expectDateParts(
        getMinEndDate(undefined, true),
        APPLICATION_START_DATE.getFullYear(),
        APPLICATION_START_DATE.getMonth() + 1,
        APPLICATION_START_DATE.getDate()
      );
    });
  });

  describe('getMaxEndDate', () => {
    it('returns the default max end date 12 months minus one day from start date', () => {
      expectDateParts(getMaxEndDate('2024-02-15'), 2025, 2, 14);
    });

    it('uses application start date fallback and custom month count', () => {
      const expectedDate = subDays(addMonths(APPLICATION_START_DATE, 2), 1);

      expectDateParts(
        getMaxEndDate(undefined, 2),
        expectedDate.getFullYear(),
        expectedDate.getMonth() + 1,
        expectedDate.getDate()
      );
    });
  });

  describe('validateFinnishDatePattern', () => {
    it('returns false when called without a value', () => {
      expect(validateFinnishDatePattern()).toBe(false);
    });

    it('accepts valid Finnish date format', () => {
      expect(validateFinnishDatePattern('1.2.2024')).toBe(true);
    });

    it('rejects invalid Finnish date format', () => {
      expect(validateFinnishDatePattern('01/02/2024')).toBe(false);
    });
  });

  describe('getDateFromDateString', () => {
    it('returns null for missing or too short values', () => {
      expect(getDateFromDateString('')).toBeNull();
      expect(getDateFromDateString('1.1.24')).toBeNull();
    });

    it('parses a Finnish date string', () => {
      expectDateParts(getDateFromDateString('1.2.2024'), 2024, 2, 1);
    });

    it('parses a backend date string', () => {
      expectDateParts(getDateFromDateString('2024-02-01'), 2024, 2, 1);
    });

    it('returns null for invalid long date strings', () => {
      expect(getDateFromDateString('not-a-date')).toBeNull();
      expect(getDateFromDateString('32.1.2024')).toBeNull();
      expect(getDateFromDateString('31.2.2024')).toBeNull();
    });

    it('returns null when parser returns an invalid Date object', async () => {
      jest.resetModules();
      jest.doMock('date-fns/parse', () => ({
        __esModule: true,
        default: jest.fn(() => new Date(Number.NaN)),
      }));

      try {
        const { getDateFromDateString: getDateFromDateStringWithMock } = await import(
          'benefit-shared/utils/dates'
        );

        expect(getDateFromDateStringWithMock('1.2.2024')).toBeNull();
      } finally {
        jest.dontMock('date-fns/parse');
        jest.resetModules();
      }
    });
  });

  describe('validateDateIsFromCurrentYearOnwards', () => {
    it('returns true for a date in the current year', () => {
      expect(validateDateIsFromCurrentYearOnwards(`1.1.${new Date().getFullYear()}`)).toBe(
        true
      );
    });

    it('returns false for a date before the current year or invalid date', () => {
      expect(
        validateDateIsFromCurrentYearOnwards(`31.12.${new Date().getFullYear() - 1}`)
      ).toBe(false);
      expect(validateDateIsFromCurrentYearOnwards('invalid-date')).toBe(false);
    });
  });

  describe('validateIsTodayOrPastDate', () => {
    it('returns true for past dates', () => {
      expect(validateIsTodayOrPastDate('2020-01-01')).toBe(true);
    });

    it('returns false for future or invalid dates', () => {
      const nextYear = new Date().getFullYear() + 1;

      expect(validateIsTodayOrPastDate(`1.1.${nextYear}`)).toBe(false);
      expect(validateIsTodayOrPastDate('invalid-date')).toBe(false);
    });
  });

  describe('validateDateWithinMonths', () => {
    it('returns true for a string date inside the range', () => {
      expect(validateDateWithinMonths(new Date().toISOString(), 1)).toBe(true);
    });

    it('returns true for a date exactly on the boundary', () => {
      const boundaryDate = new Date();
      boundaryDate.setMonth(boundaryDate.getMonth() - 1);

      expect(validateDateWithinMonths(boundaryDate, 1)).toBe(true);
    });

    it('returns false for invalid or too old dates', () => {
      expect(validateDateWithinMonths('invalid-date', 1)).toBe(false);

      const oldDate = new Date();
      oldDate.setMonth(oldDate.getMonth() - 2);

      expect(validateDateWithinMonths(oldDate, 1)).toBe(false);
    });
  });

  describe('validateIsAfterOrOnDate', () => {
    it('returns true when value is equal to or after the other value', () => {
      expect(validateIsAfterOrOnDate('2024-02-01', '2024-02-01')).toBe(true);
      expect(validateIsAfterOrOnDate('2024-02-02', '2024-02-01')).toBe(true);
    });

    it('returns false when value is before or either date is invalid', () => {
      expect(validateIsAfterOrOnDate('2024-01-31', '2024-02-01')).toBe(false);
      expect(validateIsAfterOrOnDate('invalid-date', '2024-02-01')).toBe(false);
    });
  });

  describe('validateIsBeforeOrOnDate', () => {
    it('returns true when value is equal to or before the other value', () => {
      expect(validateIsBeforeOrOnDate('2024-02-01', '2024-02-01')).toBe(true);
      expect(validateIsBeforeOrOnDate('2024-01-31', '2024-02-01')).toBe(true);
    });

    it('returns false when value is after or either date is invalid', () => {
      expect(validateIsBeforeOrOnDate('2024-02-02', '2024-02-01')).toBe(false);
      expect(validateIsBeforeOrOnDate('2024-02-01', 'invalid-date')).toBe(false);
    });
  });
});