/**
 * Enum-style constant for all known VTJ exception codes.
 * Values must stay in sync with VTJ_EXCEPTIONS in vtj-exceptions.ts
 * and with handlerApplication.vtjException translation keys.
 */
const VtjException = {
  NOT_FOUND: 'notFound',
  MISSING_SSN: 'missingSsn',
  DIFFERENT_LAST_NAME: 'differentLastName',
  NOT_IN_TARGET_AGE_GROUP: 'notInTargetAgeGroup',
  ADDRESS_NOT_FOUND: 'addressNotFound',
  DIFFERENT_POST_CODE: 'differentPostCode',
  OUTSIDE_HELSINKI: 'outsideHelsinki',
  IS_DEAD: 'isDead',
} as const;

export type VtjExceptionValue = typeof VtjException[keyof typeof VtjException];

export default VtjException;
