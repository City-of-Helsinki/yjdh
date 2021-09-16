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

// eslint-disable-next-line security/detect-unsafe-regex
export const DECIMAL_NUMBER_REGEX = /^\d+(\.\d{1,2})?$/;

export const EMAIL_REGEX =
  // eslint-disable-next-line security/detect-unsafe-regex
  /^(([^\s"(),.:;<>@[\\\]]+(\.[^\s"(),.:;<>@[\\\]]+)*)|(".+"))@((\[(?:\d{1,3}\.){3}\d{1,3}])|(([\dA-Za-z-]+\.)+[A-Za-z]{2,}))$/;

// eslint-disable-next-line security/detect-unsafe-regex
export const DATE_UI_REGEX = /^(?:\d{1,2}.){2}\d{4}$/;
export const DATE_BACKEND_REGEX = /^\d{4}-\d{2}-\d{2}$/;
