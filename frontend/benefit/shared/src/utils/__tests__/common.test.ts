import { PAY_SUBSIDY_GRANTED } from 'benefit-shared/constants';
import { MessageData } from 'benefit-shared/types/application';
import {
  formatIBAN,
  isTruthy,
  mapMessages,
  paySubsidyTitle,
  setAppLoaded,
} from 'benefit-shared/utils/common';

jest.mock('shared/utils/date.utils', () => ({
  convertToUIDateAndTimeFormat: jest.fn((value: string | undefined) =>
    value ? `formatted:${value}` : ''
  ),
}));

describe('common utils', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('mapMessages', () => {
    it('returns an empty array for undefined input', () => {
      // eslint-disable-next-line unicorn/no-useless-undefined
      expect(mapMessages(undefined)).toEqual([]);
    });

    it('maps backend message fields to camelCase and formats timestamps', () => {
      const messages: MessageData[] = [
        {
          id: '1',
          content: 'Test message',
          message_type: PAY_SUBSIDY_GRANTED.GRANTED as never,
          created_at: '2024-05-01T10:00:00Z',
          modified_at: '2024-05-02T11:30:00Z',
          seen_by_applicant: true,
          sender: 'Handler',
        },
      ];

      expect(mapMessages(messages)).toEqual([
        {
          id: '1',
          content: 'Test message',
          messageType: PAY_SUBSIDY_GRANTED.GRANTED,
          createdAt: 'formatted:2024-05-01T10:00:00Z',
          modifiedAt: 'formatted:2024-05-02T11:30:00Z',
          seenByApplicant: true,
          sender: 'Handler',
        },
      ]);
    });
  });

  describe('setAppLoaded', () => {
    it('removes waiting class from app loader when present', () => {
      document.body.innerHTML =
        '<div id="app-loader" class="app-waits-for-client other-class"></div>';

      setAppLoaded();

      expect(document.querySelector('#app-loader')).not.toHaveClass(
        'app-waits-for-client'
      );
      expect(document.querySelector('#app-loader')).toHaveClass('other-class');
    });

    it('does nothing when app loader is missing', () => {
      expect(() => setAppLoaded()).not.toThrow();
    });

    it('does nothing when window is undefined', () => {
      const originalWindow = global.window;

      Object.defineProperty(global, 'window', {
        value: undefined,
        configurable: true,
      });

      expect(() => setAppLoaded()).not.toThrow();

      Object.defineProperty(global, 'window', {
        value: originalWindow,
        configurable: true,
      });
    });
  });

  describe('isTruthy', () => {
    it.each([
      ['1', true],
      ['true', true],
      [true, true],
      ['0', false],
      ['false', false],
      [false, false],
    ])('returns %s => %s', (value, expected) => {
      expect(isTruthy(value )).toBe(expected);
    });
  });

  describe('formatIBAN', () => {
    it('formats a valid IBAN', () => {
      expect(formatIBAN('FI4250001510000023')).toBe('FI42 5000 1510 0000 23');
    });

    it('returns an empty string for nullish IBAN', () => {
      // eslint-disable-next-line unicorn/no-useless-undefined
      expect(formatIBAN(undefined)).toBe('');
      expect(formatIBAN(null)).toBe('');
    });
  });

  describe('paySubsidyTitle', () => {
    it('returns the aged subsidy title for granted aged subsidy', () => {
      expect(paySubsidyTitle(PAY_SUBSIDY_GRANTED.GRANTED_AGED)).toBe(
        'common:applications.sections.attachments.types.agedSubsidyDecision.title'
      );
    });

    it('returns the regular subsidy title for other subsidy values', () => {
      expect(paySubsidyTitle(PAY_SUBSIDY_GRANTED.GRANTED)).toBe(
        'common:applications.sections.attachments.types.paySubsidyDecision.title'
      );
      expect(paySubsidyTitle(PAY_SUBSIDY_GRANTED.NOT_GRANTED)).toBe(
        'common:applications.sections.attachments.types.paySubsidyDecision.title'
      );
    });
  });
});