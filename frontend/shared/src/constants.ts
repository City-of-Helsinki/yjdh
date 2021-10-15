export const MAIN_CONTENT_ID = 'main_content';
export const INVALID_FIELD_CLASS = 'invalid-field';

// For the following regex constants, see: frontend/shared/src/__tests__/constants.test.ts
export const ADDRESS_REGEX = /^([\d (),./A-Za-zÄÅÖäåö-]+)$/;
export const COMPANY_BANK_ACCOUNT_NUMBER = /^FI\d{16}$/;
export const PHONE_NUMBER_REGEX =
  /^((\+358[ -]*)+|(\\(\d{2,3}\\)[ -]*)|(\d{2,4})[ -]*)*?\d{3,4}?[ -]*\d{3,4}?$/;
export const POSTAL_CODE_REGEX = /^\d{5}$/;
export const NAMES_REGEX =
  /^[\w',.ÄÅÖäåö-][^\d!#$%&()*+/:;<=>?@[\\\]_{|}~¡¿÷ˆ]+$/;
export const CITY_REGEX = /^[ A-Za-zÄÅÖäåö-]+$/;

export const EMAIL_REGEX =
  // eslint-disable-next-line security/detect-unsafe-regex
  /^[\w&*+-]+(?:\.[\w&*+-]+)*@(?:[\dA-Za-z-]+\.)+[A-Za-z]{2,7}$/;

export const DATE_UI_REGEX =
  /^(0?[1-9]|[12]\d|3[01])\.(0?[1-9]|1[0-2])\.\d{4}$/;
export const DATE_BACKEND_REGEX =
  /^\d{4}-(0?[1-9]|1[0-2])-(0?[1-9]|[12]\d|3[01])$/;
