import { ChangeData, ChangeListData } from 'benefit/handler/types/changes';
import { IconArrowRight } from 'hds-react';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import { $Actions } from 'shared/components/messaging/Messaging.sc';
import { convertToUIDateAndTimeFormat } from 'shared/utils/date.utils';

import { $ViewFieldBold } from '../applicationForm/ApplicationForm.sc';
import {
  $ChangeRowLabel,
  $ChangeRowValue,
  $ChangeSet,
  $ChangeSetHeader,
} from '../applicationForm/reviewChanges/ReviewEditChanges.sc';
import {
  formatOrTranslateValue,
  prepareChangeFieldName,
  translateLabelFromPath,
} from '../applicationForm/reviewChanges/utils';

type ChangeListApplicantProps = {
  data: ChangeListData;
};

const ChangesByApplicant: React.FC<ChangeListApplicantProps> = ({
  data,
}: ChangeListApplicantProps) => {
  const { t } = useTranslation();
  const { date, user, changes } = data;

  return (
    <$Actions>
      <$ChangeSet as="dl">
        <$ChangeSetHeader>
          <span>{user}</span>
          <span>{convertToUIDateAndTimeFormat(date)}</span>
        </$ChangeSetHeader>
        {changes?.map((change: ChangeData) => (
          <React.Fragment key={`${date}-${user}-${change?.old}-${change?.new}`}>
            <$ChangeRowLabel>
              <$ViewFieldBold>
                {translateLabelFromPath(
                  t,
                  prepareChangeFieldName(change.field).split('.')
                )}
              </$ViewFieldBold>
            </$ChangeRowLabel>
            <$ChangeRowValue>
              <span>
                {formatOrTranslateValue(
                  t,
                  change.old,
                  prepareChangeFieldName(change.field)
                )}
              </span>
              <IconArrowRight />
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
      </$ChangeSet>
    </$Actions>
  );
};

export default ChangesByApplicant;
