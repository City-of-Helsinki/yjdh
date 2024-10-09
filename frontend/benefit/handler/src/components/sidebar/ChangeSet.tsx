import { ChangeData, ChangeListData } from 'benefit/handler/types/changes';
import { IconArrowRight } from 'hds-react';
import { TFunction, useTranslation } from 'next-i18next';
import * as React from 'react';
import { convertToUIDateAndTimeFormat } from 'shared/utils/date.utils';

import {
  $ViewField,
  $ViewFieldBold,
} from '../applicationForm/ApplicationForm.sc';
import {
  $ChangeRowLabel,
  $ChangeRowValue,
  $ChangeSet,
  $ChangeSetFooter,
  $ChangeSetHeader,
} from '../applicationForm/reviewChanges/ReviewEditChanges.sc';
import {
  formatOrTranslateValue,
  prepareChangeFieldName,
  translateLabelFromPath,
} from '../applicationForm/reviewChanges/utils';

type ChangeSetProps = {
  data: ChangeListData;
};

const valueLengthsExceedRowLayout = (
  t: TFunction,
  change: ChangeData
): boolean =>
  formatOrTranslateValue(t, change.old, prepareChangeFieldName(change.field))
    .length +
    formatOrTranslateValue(t, change.new, prepareChangeFieldName(change.field))
      .length >
  54;

const ChangeSet: React.FC<ChangeSetProps> = ({ data }: ChangeSetProps) => {
  const { t } = useTranslation();
  const { date, user, changes, reason } = data;

  return (
    <$ChangeSet>
      <$ChangeSetHeader>
        <span>{user}</span>
        <span>{convertToUIDateAndTimeFormat(date)}</span>
      </$ChangeSetHeader>
      <dl>
        {changes.map((change: ChangeData) => (
          <React.Fragment
            key={`${date}-${reason}-${user}-${change?.field}-${change?.old}-${change?.new}`}
          >
            <$ChangeRowLabel>
              <$ViewFieldBold>
                {translateLabelFromPath(
                  t,
                  prepareChangeFieldName(change.field).split('.')
                )}
              </$ViewFieldBold>
            </$ChangeRowLabel>
            <$ChangeRowValue
              direction={
                valueLengthsExceedRowLayout(t, change) ? 'column' : 'row'
              }
            >
              <>
                <span>
                  {formatOrTranslateValue(
                    t,
                    change.old,
                    prepareChangeFieldName(change.field)
                  )}
                </span>
                <IconArrowRight />
              </>
              <span>
                {formatOrTranslateValue(
                  t,
                  change.new,
                  prepareChangeFieldName(change.field)
                )}
              </span>
            </$ChangeRowValue>
          </React.Fragment>
        ))}
      </dl>
      <$ChangeSetFooter>
        {changes.length > 0 && (
          <p>
            {t('common:changes.header.amountOfChanges', {
              amount: changes.length,
            })}
          </p>
        )}
        <hr />
        <$ViewFieldBold>
          {t('common:applications.sections.fields.changeReason.placeholder')}
        </$ViewFieldBold>
        <$ViewField>{formatOrTranslateValue(t, reason)}</$ViewField>
      </$ChangeSetFooter>
    </$ChangeSet>
  );
};

export default ChangeSet;
