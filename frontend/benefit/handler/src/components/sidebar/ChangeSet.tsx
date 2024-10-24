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
  translateChangeFieldMeta,
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

  const isAttachmentChange = changes.find(
    (change) => change.field === 'attachments'
  );

  return (
    <$ChangeSet isChangeByStaff={user.staff}>
      <$ChangeSetHeader>
        <span>{user.name}</span>
        <span>{convertToUIDateAndTimeFormat(date)}</span>
      </$ChangeSetHeader>
      <dl>
        {changes.map((change: ChangeData) => (
          <React.Fragment
            key={`${date}-${reason}-${user.name}-${change?.field}-${change?.old}-${change?.new}`}
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
              {!isAttachmentChange && (
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
              )}
              <span>
                {formatOrTranslateValue(
                  t,
                  change.new,
                  prepareChangeFieldName(change.field)
                )}
                {change.meta
                  ? ` (${translateChangeFieldMeta(t, change.meta)})`
                  : null}
              </span>
            </$ChangeRowValue>
          </React.Fragment>
        ))}
      </dl>
      <$ChangeSetFooter>
        {changes.length > 1 && !isAttachmentChange && (
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
        <$ViewField>
          {isAttachmentChange
            ? t('common:changes.fields.attachments.newAttachment')
            : user.staff
            ? formatOrTranslateValue(t, reason)
            : t(
                'common:applications.sections.fields.changeReason.additionalInformationRequired'
              )}
        </$ViewField>
      </$ChangeSetFooter>
    </$ChangeSet>
  );
};

export default ChangeSet;
