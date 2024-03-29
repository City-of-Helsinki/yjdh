export const MAIN_CONTENT_ID = 'main_content';
export const INVALID_FIELD_CLASS = 'invalid-field';

// For the following regex constants, see: frontend/shared/src/__tests__/constants.test.ts
export const ADDRESS_REGEX = /^([\d (),./A-Za-zÄÅÖäåö-]+)$/;
export const COMPANY_BANK_ACCOUNT_NUMBER = /^FI\d{16}$/;
export const PHONE_NUMBER_REGEX =
  // eslint-disable-next-line security/detect-unsafe-regex
  /^((\+358[ -]*)+|(\\(\d{2,3}\\)[ -]*)|(\d{2,4})[ -]*)*?\d{3,4}?[ -]*\d{3,4}?$/;
export const POSTAL_CODE_REGEX = /^\d{5}$/;
export const NAMES_REGEX = /^\S.*$/;
export const CITY_REGEX = /^[ A-Za-zÄÅÖäåö-]+$/;

export const EMAIL_REGEX =
  // eslint-disable-next-line security/detect-unsafe-regex
  /^[\w&*+-]+(?:\.[\w&*+-]+)*@(?:[\dA-Za-z-]+\.)+[A-Za-z]{2,7}$/;

export const DATE_UI_REGEX =
  /^(0?[1-9]|[12]\d|3[01])\.(0?[1-9]|1[0-2])\.\d{4}$/;

export const DATE_BACKEND_REGEX =
  /^\d{4}-(0?[1-9]|1[0-2])-(0?[1-9]|[12]\d|3[01])$/;

export const DATE_VTJ_REGEX = /^\d{4}(0?[1-9]|1[0-2])(0?[1-9]|[12]\d|3[01])$/;

// a modification of finnish ssn regex https://regex101.com/library/HPFWw6 that does not accept "fake" (keinotunnus) ssn's:
// https://www.tuomas.salste.net/doc/tunnus/henkilotunnus.html#keinotunnus (more info only in finnish)
export const FINNISH_SSN_REGEX = /^\d{6}[+a-fu-y-][0-8]\d{2}[\da-fhj-npr-y]$/i;
export const WEBSITE_URL =
  /(https?:\/\/(?:www\.|(?!www))[\da-z][\da-z-]+[\da-z]\.\S{2,}|www\.[\da-z][\da-z-]+[\da-z]\.\S{2,}|https?:\/\/(?:www\.|(?!www))[\da-z]+\.\S{2,}|www\.[\da-z]+\.\S{2,})/gi;
