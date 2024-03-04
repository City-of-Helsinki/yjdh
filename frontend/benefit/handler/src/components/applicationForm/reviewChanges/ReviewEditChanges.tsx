import { APPLICATION_FIELD_KEYS } from 'benefit/handler/constants';
import DeMinimisContext from 'benefit/handler/context/DeMinimisContext';
import { Application } from 'benefit/handler/types/application';
import deepDiff from 'deep-diff';
import { IconArrowRight } from 'hds-react';
import { useTranslation } from 'next-i18next';
import React, { Fragment, useEffect, useState } from 'react';
import { formatFloatToCurrency } from 'shared/utils/string.utils';

import { $ViewFieldBold } from '../ApplicationForm.sc';
import { $ChangeRowLabel, $ChangeRowValue } from './ReviewEditChanges.sc';
import {
  formatOrTranslateValue,
  getDeMinimisChanged,
  getDeMinimisDates,
  getDeMinimisGranters,
  getDeMinimisSum,
  getDiffPrefilter,
  translateLabelFromPath,
} from './utils';
import { APPLICATION_ORIGINS } from 'benefit-shared/constants';

export type ReviewEditChangesProps = {
  initialValues: Application;
  currentValues: Application;
};

type Difference = {
  lhs: string | number;
  rhs: string | number;
  path: string[];
};

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

  const [changes, setChanges] = useState<Difference[]>([]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const diff: Difference[] =
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      deepDiff(initialValues, currentValues, (path: string[], key: string) =>
        getDiffPrefilter(
          path,
          key,
          requiredKeys,
          currentValues.applicationOrigin === APPLICATION_ORIGINS.HANDLER
        )
      ) || [];
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
