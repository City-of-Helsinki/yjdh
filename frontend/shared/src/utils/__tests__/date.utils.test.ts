import {
  convertToBackendDateFormat,
  convertToUIDateAndTimeFormat,
  convertToUIDateFormat,
  days360,
  diffMonths,
  getCorrectEndDate,
  isLeapYear,
  isWithinInterval,
  parseDate,
  validateDateIsFromCurrentYearOnwards,
} from '../date.utils';

describe('dates', () => {
  describe('isLeapYear', () => {
    it('should be leap year', () => {
      expect(isLeapYear(2020)).toBe(true);
      expect(isLeapYear(2012)).toBe(true);
    });
  });

  describe('days360', () => {
    it('should be expected result', () => {
      expect(days360(parseDate('1.9.2021'), parseDate('1.10.2021'))).toBe(30);
      expect(days360(parseDate('1.9.2021'), parseDate('30.9.2021'))).toBe(29);
      expect(days360(parseDate('1.8.2021'), parseDate('2.9.2021'))).toBe(31);
      expect(days360(parseDate('1.8.2021'), parseDate('31.8.2021'))).toBe(29);
      expect(days360(parseDate('1.8.2021'), parseDate('29.8.2021'))).toBe(28);
      expect(days360(parseDate('16.9.2021'), parseDate('11.12.2021'))).toBe(85);
      expect(days360(parseDate('10.12.2021'), parseDate('20.3.2022'))).toBe(
        100
      );
      expect(days360(parseDate('1.12.2021'), parseDate('1.12.2022'))).toBe(360);
    });
  });

  describe('diffMonths', () => {
    it('should be 12 months between 1.1.2021 and 31.12.2021', () => {
      const diffMonthsResult = diffMonths(
        parseDate('31.12.2021'),
        parseDate('1.1.2021')
      );
      expect(diffMonthsResult).toBe(12);
    });
    it('should be negative difference months between 31.12.2021 and 1.01.2021', () => {
      const diffMonthsResult = diffMonths(
        parseDate('1.1.2021'),
        parseDate('31.12.2021')
      );
      expect(diffMonthsResult).toBeLessThan(0);
    });
  });

  describe('getCorrectEndDate', () => {
    it('should be expected result', () => {
      expect(getCorrectEndDate('31.12.2022', '1.1.2021')).toBe('31.12.2022');
      expect(getCorrectEndDate('31.12.2021', '1.1.2023')).toBe('1.1.2023');
      expect(getCorrectEndDate('31.12.', '1.1.2021')).toBeUndefined();
      expect(getCorrectEndDate('31.12.', '2021')).toBeUndefined();
    });
  });

  describe('validateDateIsFromCurrentYearOnwards', () => {
    const currentYear = new Date().getFullYear();
    it('should return false', () => {
      expect(
        validateDateIsFromCurrentYearOnwards(`31.12.${currentYear - 1}`)
      ).toBe(false);
      expect(
        validateDateIsFromCurrentYearOnwards(`2.1.${currentYear - 4}`)
      ).toBe(false);
      expect(
        validateDateIsFromCurrentYearOnwards(`4.8.${currentYear - 2}`)
      ).toBe(false);
    });
    it('should return true', () => {
      expect(validateDateIsFromCurrentYearOnwards(`1.1.${currentYear}`)).toBe(
        true
      );
      expect(
        validateDateIsFromCurrentYearOnwards(`3.4.${currentYear + 5}`)
      ).toBe(true);
    });
  });

  describe('Date conversions', () => {
    it('should convert date object to given format', () => {
      const date = new Date(2020, 0, 1, 15, 10, 25);
      expect(convertToBackendDateFormat(date)).toBe('2020-01-01');
      expect(convertToUIDateFormat(date)).toBe('1.1.2020');
      expect(convertToUIDateAndTimeFormat(date)).toBe('1.1.2020. 15:10');
    });
    it('should convert backend date format to given format', () => {
      expect(convertToBackendDateFormat('2020-01-01')).toBe('2020-01-01');
      expect(convertToUIDateFormat('2020-01-01')).toBe('1.1.2020');
      expect(convertToUIDateAndTimeFormat('2020-01-01')).toBe(
        '1.1.2020. 00:00'
      );
    });
    it(`should convert ui date format (d.M.yyyy) to given format`, () => {
      expect(convertToBackendDateFormat('1.5.1999')).toBe('1999-05-01');
      expect(convertToUIDateFormat('1.5.1999')).toBe('1.5.1999');
      expect(convertToUIDateAndTimeFormat('1.5.1999')).toBe('1.5.1999. 00:00');
    });
    it(`should convert backend date format (yyyy-MM-dd) to given format`, () => {
      expect(convertToBackendDateFormat('2020-05-01')).toBe('2020-05-01');
      expect(convertToUIDateFormat('2020-05-01')).toBe('1.5.2020');
      expect(convertToUIDateAndTimeFormat('2020-05-01')).toBe(
        '1.5.2020. 00:00'
      );
    });
    it(`should convert VTJ date format (yyyyMMdd) to given format`, () => {
      expect(convertToBackendDateFormat('20200501')).toBe('2020-05-01');
      expect(convertToUIDateFormat('20200501')).toBe('1.5.2020');
      expect(convertToUIDateAndTimeFormat('20200501')).toBe('1.5.2020. 00:00');
    });
    it(`should convert ISO-8601 format (yyyy-MM-ddTHH:mm:ss.sssZ) to given format`, () => {
      expect(convertToBackendDateFormat('2022-04-13T11:49:07Z')).toBe(
        '2022-04-13'
      );
      expect(convertToUIDateFormat('2022-04-13T11:49:07Z')).toBe('13.4.2022');
      expect(convertToUIDateAndTimeFormat('2022-04-13T11:49:07Z')).toBe(
        '13.4.2022. 14:49'
      );
      const newYearDate = new Date(2020, 0, 1, 22, 5, 31).toISOString();
      expect(convertToBackendDateFormat(newYearDate)).toBe('2020-01-01');
      expect(convertToUIDateFormat(newYearDate)).toBe('1.1.2020');
      expect(convertToUIDateAndTimeFormat(newYearDate)).toBe('1.1.2020. 22:05');
    });
    it(`returns empty string when unknown format`, () => {
      expect(convertToBackendDateFormat('01/01/2020')).toBe('');
      expect(convertToUIDateFormat('01/01/2020')).toBe('');
      expect(convertToUIDateAndTimeFormat('01/01/2020')).toBe('');
    });
  });

  describe('isWithinDates when', () => {
    for (const currDate of [
      new Date(2020, 5, 5, 15, 10, 25),
      '2020-06-05',
      '20200605',
      '5.6.2020',
      '2020-06-05T14:00:07Z',
    ]) {
      it(`'s current date is in format of ${currDate.toString()}`, () => {
        const startDate = new Date(2020, 5, 4);
        const endDate = new Date(2020, 6, 1);
        expect(isWithinInterval(currDate, { startDate, endDate })).toBeTruthy();
        expect(isWithinInterval(currDate, { startDate })).toBeTruthy();
        expect(isWithinInterval(currDate, { endDate })).toBeTruthy();
        expect(
          isWithinInterval(endDate, { startDate, endDate: currDate })
        ).toBeFalsy();
        expect(
          isWithinInterval(startDate, { startDate: currDate, endDate })
        ).toBeFalsy();
        expect(
          isWithinInterval(currDate, {
            startDate: '2020-06-04',
            endDate: '2020-07-01',
          })
        ).toBeTruthy();
        expect(
          isWithinInterval(currDate, { endDate: '2020-07-01' })
        ).toBeTruthy();
        expect(
          isWithinInterval(currDate, { startDate: '2020-07-01' })
        ).toBeFalsy();
        expect(
          isWithinInterval(currDate, { startDate: '2020-06-04' })
        ).toBeTruthy();
        expect(
          isWithinInterval(currDate, { endDate: '2020-06-04' })
        ).toBeFalsy();
        expect(
          isWithinInterval(currDate, {
            startDate: '4.6.2020',
            endDate: '1.7.2020',
          })
        ).toBeTruthy();
        expect(
          isWithinInterval(currDate, { startDate: '4.6.2020' })
        ).toBeTruthy();
        expect(isWithinInterval(currDate, { endDate: '4.6.2020' })).toBeFalsy();
        expect(
          isWithinInterval(currDate, { endDate: '1.7.2020' })
        ).toBeTruthy();
        expect(
          isWithinInterval(currDate, { startDate: '1.7.2020' })
        ).toBeFalsy();
        expect(
          isWithinInterval(currDate, {
            startDate: '2020-06-04T11:49:07Z',
            endDate: '2020-07-01T11:49:07Z',
          })
        ).toBeTruthy();
        expect(
          isWithinInterval(currDate, { startDate: '2020-06-04T11:49:07Z' })
        ).toBeTruthy();
        expect(
          isWithinInterval(currDate, { endDate: '2020-06-04T11:49:07Z' })
        ).toBeFalsy();
        expect(
          isWithinInterval(currDate, { endDate: '2020-07-01T11:49:07Z' })
        ).toBeTruthy();
        expect(
          isWithinInterval(currDate, { startDate: '2020-07-01T11:49:07Z' })
        ).toBeFalsy();
      });
    }
  });
});
