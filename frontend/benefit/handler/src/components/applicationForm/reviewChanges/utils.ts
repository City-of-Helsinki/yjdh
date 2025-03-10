import { APPLICATION_FIELD_KEYS } from 'benefit/handler/constants';
import {
  APPLICATION_STATUSES,
  ATTACHMENT_TYPES,
  EMPLOYEE_KEYS,
  PAY_SUBSIDY_GRANTED,
} from 'benefit-shared/constants';
import { DeMinimisAid } from 'benefit-shared/types/application';
import { formatIBAN } from 'benefit-shared/utils/common';
import camelCase from 'lodash/camelCase';
import { TFunction } from 'next-i18next';
import { convertToUIDateFormat } from 'shared/utils/date.utils';
import { formatFloatToCurrency } from 'shared/utils/string.utils';

export const formatOrTranslateValue = (
  t: TFunction,
  value: string | boolean | number,
  description = ''
): string => {
  const key = description.split('.').pop();

  if (value === '' || value === null || value === undefined) {
    return `(${t('common:utility.empty')})`;
  }
  if (typeof value === 'boolean') {
    return value ? t('common:utility.yes') : t('common:utility.no');
  }
  if (typeof value === 'object' && value !== null) {
    return value;
  }

  if (
    [
      EMPLOYEE_KEYS.MONTHLY_PAY,
      EMPLOYEE_KEYS.OTHER_EXPENSES,
      EMPLOYEE_KEYS.VACATION_MONEY,
    ].includes(key as EMPLOYEE_KEYS)
  ) {
    return formatFloatToCurrency(value);
  }

  if (
    [APPLICATION_FIELD_KEYS.COMPANY_BANK_ACCOUNT_NUMBER].includes(
      key as APPLICATION_FIELD_KEYS
    )
  ) {
    return formatIBAN(String(value));
  }

  // Has letters?
  if (typeof value === 'string' && /\w+/g.test(value)) {
    if (
      [
        PAY_SUBSIDY_GRANTED.GRANTED,
        PAY_SUBSIDY_GRANTED.GRANTED_AGED,
        PAY_SUBSIDY_GRANTED.NOT_GRANTED,
      ].includes(value as PAY_SUBSIDY_GRANTED)
    ) {
      return t(
        `common:applications.sections.fields.paySubsidyGranted.${camelCase(
          value
        )}`
      );
    }

    if (
      [
        APPLICATION_STATUSES.HANDLING,
        APPLICATION_STATUSES.RECEIVED,
        APPLICATION_STATUSES.INFO_REQUIRED,
        APPLICATION_STATUSES.ACCEPTED,
        APPLICATION_STATUSES.REJECTED,
        APPLICATION_STATUSES.CANCELLED,
      ].includes(value as APPLICATION_STATUSES)
    ) {
      return t(`common:applications.list.columns.applicationStatuses.${value}`);
    }

    return value;
  }

  return String(value);
};

export const translateLabelFromPath = (
  t: TFunction,
  path: string[]
): string => {
  const key = path.join('.').replace(/^employee\./, '');
  return t(`common:changes.fields.${key}.label`);
};

export const getDeMinimisSum = (aidSet: DeMinimisAid[]): number =>
  aidSet.length > 0
    ? aidSet.reduce((acc, val) => acc + parseFloat(val.amount as string), 0)
    : 0;

export const getDeMinimisGranters = (aidSet: DeMinimisAid[]): string =>
  aidSet.map((aid: DeMinimisAid) => aid.granter).join(', ');

export const getDeMinimisDates = (aidSet: DeMinimisAid[]): string =>
  aidSet
    .map((aid: DeMinimisAid) => convertToUIDateFormat(aid.grantedAt))
    .join(', ');

export const getDeMinimisChanged = (
  setA: DeMinimisAid,
  setB: DeMinimisAid
): boolean => JSON.stringify(setA) !== JSON.stringify(setB);

export const getDiffPrefilter = (
  path: string[],
  key: string,
  requiredKeys: Set<APPLICATION_FIELD_KEYS>,
  isOfHandlerOrigin: boolean
): boolean => {
  if (path.length > 0 && path.includes('employee')) return false;
  if (
    [
      APPLICATION_FIELD_KEYS.DE_MINIMIS_AID,
      APPLICATION_FIELD_KEYS.DE_MINIMIS_AID_SET,
    ].includes(key as APPLICATION_FIELD_KEYS)
  )
    return true;

  if (
    key === APPLICATION_FIELD_KEYS.PAPER_APPLICATION_DATE &&
    !isOfHandlerOrigin
  ) {
    return true;
  }

  const isRequiredKey = requiredKeys.has(key as APPLICATION_FIELD_KEYS);
  return !isRequiredKey;
};

export const prepareChangeFieldName = (fieldName: string): string =>
  camelCase(fieldName.replace('employee', ''));

export const translateChangeFieldMeta = (
  t: TFunction,
  meta: string
): string => {
  const attachmentTypes = [
    ATTACHMENT_TYPES.EMPLOYMENT_CONTRACT,
    ATTACHMENT_TYPES.PAY_SUBSIDY_CONTRACT,
    ATTACHMENT_TYPES.EDUCATION_CONTRACT,
    ATTACHMENT_TYPES.HELSINKI_BENEFIT_VOUCHER,
    ATTACHMENT_TYPES.EMPLOYEE_CONSENT,
    ATTACHMENT_TYPES.FULL_APPLICATION,
    ATTACHMENT_TYPES.OTHER_ATTACHMENT,
    // eslint-disable-next-line unicorn/no-array-callback-reference
  ].map(camelCase);

  // eslint-disable-next-line security/detect-non-literal-regexp
  const regexp = new RegExp(attachmentTypes.join('|'), 'g');
  const key = camelCase(meta);
  return key.replace(
    regexp,
    t(`common:applications.sections.attachments.types.${key}.title`)
  );
};
