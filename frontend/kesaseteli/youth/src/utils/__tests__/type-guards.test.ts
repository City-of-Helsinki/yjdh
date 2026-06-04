import Axios from 'axios';

import {
  isYouthApplicationCreationError,
  isYouthApplicationValidationError,
} from '../type-guards';

describe('type-guards', () => {
  describe('isYouthApplicationCreationError', () => {
    it('returns true for youth application creation error', () => {
      const error = {
        isAxiosError: true,
        response: {
          data: {
            code: 'already_assigned',
          },
        },
      };
      jest.spyOn(Axios, 'isAxiosError').mockReturnValueOnce(true);
      expect(isYouthApplicationCreationError(error)).toBe(true);
    });

    it('returns false for other errors', () => {
      const error = new Error('Generic error');
      jest.spyOn(Axios, 'isAxiosError').mockReturnValueOnce(false);
      expect(isYouthApplicationCreationError(error)).toBe(false);
    });

    it('returns false when no response exists', () => {
      const error = {
        isAxiosError: true,
      };
      jest.spyOn(Axios, 'isAxiosError').mockReturnValueOnce(true);
      expect(isYouthApplicationCreationError(error)).toBe(false);
    });

    it('returns false when code is not creation error code', () => {
      const error = {
        isAxiosError: true,
        response: {
          data: {
            code: 'unknown_code',
          },
        },
      };
      jest.spyOn(Axios, 'isAxiosError').mockReturnValueOnce(true);
      expect(isYouthApplicationCreationError(error)).toBe(false);
    });
  });

  describe('isYouthApplicationValidationError', () => {
    it('returns true when status is 400 and data contains field validation error', () => {
      const error = {
        isAxiosError: true,
        response: {
          status: 400,
          data: {
            first_name: ['Enter a valid value.'],
          },
        },
      };
      jest.spyOn(Axios, 'isAxiosError').mockReturnValueOnce(true);
      expect(isYouthApplicationValidationError(error)).toBe(true);
    });

    it('returns false when status is not 400', () => {
      const error = {
        isAxiosError: true,
        response: {
          status: 500,
          data: {},
        },
      };
      jest.spyOn(Axios, 'isAxiosError').mockReturnValueOnce(true);
      expect(isYouthApplicationValidationError(error)).toBe(false);
    });

    it('returns false when status is 400 but data does not contain fields', () => {
      const error = {
        isAxiosError: true,
        response: {
          status: 400,
          data: {
            unknown_field: ['Error'],
          },
        },
      };
      jest.spyOn(Axios, 'isAxiosError').mockReturnValueOnce(true);
      expect(isYouthApplicationValidationError(error)).toBe(false);
    });

    it('returns false when status is 400 and data is null/empty', () => {
      const error = {
        isAxiosError: true,
        response: {
          status: 400,
          data: null,
        },
      };
      jest.spyOn(Axios, 'isAxiosError').mockReturnValueOnce(true);
      expect(isYouthApplicationValidationError(error)).toBe(false);
    });

    it('returns false for other errors', () => {
      const error = new Error('Generic error');
      jest.spyOn(Axios, 'isAxiosError').mockReturnValueOnce(false);
      expect(isYouthApplicationValidationError(error)).toBe(false);
    });
  });
});
