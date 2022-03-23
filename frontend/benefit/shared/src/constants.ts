export enum MESSAGE_TYPES {
  NOTE = 'note',
  HANDLER_MESSAGE = 'handler_message',
  APPLICANT_MESSAGE = 'applicant_message',
}

export enum MESSAGE_URLS {
  MESSAGES = 'messages',
  NOTES = 'notes',
}

export enum VALIDATION_MESSAGE_KEYS {
  REQUIRED = 'common:form.validation.required',
  INVALID = 'common:form.validation.invalid',
  EMAIL_INVALID = 'common:form.validation.email.invalid',
  IBAN_INVALID = 'common:form.validation.iban.invalid',
  NUMBER_MIN = 'common:form.validation.number.min',
  NUMBER_MAX = 'common:form.validation.number.max',
  PHONE_INVALID = 'common:form.validation.phone.invalid',
  STRING_POSITIVENUMBER = 'common:form.validation.string.positiveNumber',
  STRING_MIN = 'common:form.validation.string.min',
  STRING_MAX = 'common:form.validation.string.max',
  SSN_INVALID = 'common:form.validation.ssn.invalid',
  URL = 'common:form.validation.string.url',
  DATE = 'common:form.validation.string.date',
  DATE_IN_THE_FUTURE = 'common:form.validation.date.mustNotInThePast',
  DATE_MIN = 'common:form.validation.date.min',
  DATE_MAX = 'common:form.validation.date.max',
  DATE_FORMAT = 'common:form.validation.date.format',
  TIME = 'common:form.validation.string.time',
  TIME_MIN = 'common:form.validation.time.min',
  TIME_MAX = 'common:form.validation.time.max',
}
