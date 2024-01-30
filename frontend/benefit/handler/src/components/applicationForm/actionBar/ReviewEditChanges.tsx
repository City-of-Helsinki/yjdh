import { APPLICATION_FIELD_KEYS } from 'benefit/handler/constants';
import DeMinimisContext from 'benefit/handler/context/DeMinimisContext';
import { Application } from 'benefit/handler/types/application';
import { EMPLOYEE_KEYS, PAY_SUBSIDY_GRANTED } from 'benefit-shared/constants';
import { DeMinimisAid } from 'benefit-shared/types/application';
import { formatIBAN } from 'benefit-shared/utils/common';
import deepDiff from 'deep-diff';
import { IconArrowRight } from 'hds-react';
import camelCase from 'lodash/camelCase';
import { TFunction, useTranslation } from 'next-i18next';
import React, { Fragment, useEffect, useState } from 'react';
import { convertToUIDateFormat } from 'shared/utils/date.utils';
import { formatFloatToCurrency } from 'shared/utils/string.utils';

import { $ViewFieldBold } from '../ApplicationForm.sc';
import { $ChangeRowLabel, $ChangeRowValue } from './ReviewEditChanges.sc';

export type ReviewEditChangesProps = {
  initialValues: Application;
  currentValues: Application;
};

type Difference = {
  lhs: string | number;
  rhs: string | number;
  path: string[];
};

const formatOrTranslateValue = (
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
  if (typeof value === 'string' && /[A-z]+/g.test(value)) {
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
    return value;
  }

  return String(value);
};

const translateLabelFromPath = (t: TFunction, path: string[]): string => {
  const key = path.join('.').replace(/^employee\./, '');
  return t(`common:changes.fields.${key}.label`);
};

const getDeMinimisSum = (aidSet: DeMinimisAid[]): number =>
  aidSet.length > 0
    ? aidSet.reduce((acc, val) => acc + parseFloat(val.amount as string), 0)
    : 0;

const getDeMinimisGranters = (aidSet: DeMinimisAid[]): string =>
  aidSet.map((aid: DeMinimisAid) => aid.granter).join(', ');

const getDeMinimisDates = (aidSet: DeMinimisAid[]): string =>
  aidSet
    .map((aid: DeMinimisAid) => convertToUIDateFormat(aid.grantedAt))
    .join(', ');

const getDeMinimisChanged = (setA: DeMinimisAid, setB: DeMinimisAid): boolean =>
  JSON.stringify(setA) !== JSON.stringify(setB);

const ReviewEditChanges: React.FC<ReviewEditChangesProps> = ({
  initialValues,
  currentValues,
}: ReviewEditChangesProps) => {
  const { t } = useTranslation();
  const { deMinimisAids } = React.useContext(DeMinimisContext);

  const deMinimisChanges = {
    initial: {
      amount: getDeMinimisSum(initialValues.deMinimisAidSet),
      granters: getDeMinimisGranters(initialValues.deMinimisAidSet),
      grantedAt: getDeMinimisDates(initialValues.deMinimisAidSet),
    },
    current: {
      amount: getDeMinimisSum(deMinimisAids),
      granters: getDeMinimisGranters(deMinimisAids),
      grantedAt: getDeMinimisDates(deMinimisAids),
    },
  };

  const requiredKeys = new Set(
    Object.values(APPLICATION_FIELD_KEYS).filter(
      (key) => key !== APPLICATION_FIELD_KEYS.CHANGE_REASON
    )
  );

  const diffPrefilter = (path: string[], key: string): boolean => {
    if (path.length > 0 && path.includes('employee')) return false;
    if (
      [
        APPLICATION_FIELD_KEYS.DE_MINIMIS_AID,
        APPLICATION_FIELD_KEYS.DE_MINIMIS_AID_SET,
      ].includes(key as APPLICATION_FIELD_KEYS)
    )
      return true;
    const isRequiredKey = requiredKeys.has(key as APPLICATION_FIELD_KEYS);
    return !isRequiredKey;
  };

  const [changes, setChanges] = useState<Difference[]>([]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const diff: Difference[] =
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      deepDiff(initialValues, currentValues, diffPrefilter) || [];
    setChanges(diff);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!initialValues.id || !currentValues.id) {
    return null;
  }

  const hasDeMinimisChanged = getDeMinimisChanged(
    deMinimisChanges.initial,
    deMinimisChanges.current
  );

  return changes?.length > 0 || hasDeMinimisChanged ? (
    <>
      <p>{t('common:applications.dialog.edit.text.hasChanges')}</p>

      <dl>
        {changes.map(
          (change: Difference): JSX.Element => (
            <Fragment key={`${change.path.join('.')}`}>
              <$ChangeRowLabel>
                <$ViewFieldBold>
                  {translateLabelFromPath(t, change.path)}
                </$ViewFieldBold>
              </$ChangeRowLabel>
              <$ChangeRowValue>
                <span>
                  {formatOrTranslateValue(t, change.lhs, change.path.join('.'))}
                </span>
                <IconArrowRight />
                <span>
                  {formatOrTranslateValue(t, change.rhs, change.path.join('.'))}
                </span>
              </$ChangeRowValue>
            </Fragment>
          )
        )}
        {hasDeMinimisChanged && (
          <>
            <$ChangeRowLabel>
              <$ViewFieldBold>
                {t('common:changes.fields.deMinimisAid.label')}
              </$ViewFieldBold>
            </$ChangeRowLabel>
            <$ChangeRowValue>
              {formatOrTranslateValue(t, deMinimisChanges.initial.granters)}
              <IconArrowRight />
              {formatOrTranslateValue(t, deMinimisChanges.current.granters)}
            </$ChangeRowValue>
            <$ChangeRowValue>
              {formatOrTranslateValue(t, deMinimisChanges.initial.grantedAt)}
              <IconArrowRight />
              {formatOrTranslateValue(t, deMinimisChanges.current.grantedAt)}
            </$ChangeRowValue>
            <$ChangeRowValue>
              <span>{`${t('common:review.fields.deMinimisAidTotal')}: `}</span>
              <span>
                {formatFloatToCurrency(deMinimisChanges.initial.amount)}
              </span>
              <IconArrowRight />
              <span>
                {formatFloatToCurrency(deMinimisChanges.current.amount)}{' '}
              </span>
            </$ChangeRowValue>
          </>
        )}
      </dl>
    </>
  ) : (
    <p>{t('common:applications.dialog.edit.text.noChanges')}</p>
  );
};

export default ReviewEditChanges;
