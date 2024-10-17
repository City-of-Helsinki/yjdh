import { ChangeListData } from 'benefit/handler/types/changes';
import { IconHistory } from 'hds-react';
import orderBy from 'lodash/orderBy';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import {
  $Actions,
  $Empty,
  $MessagesList,
} from 'shared/components/messaging/Messaging.sc';
import { convertToUIDateFormat } from 'shared/utils/date.utils';

import ChangeSet from './ChangeSet';

type ChangeListProps = {
  data: ChangeListData[];
};

const previousDate = (
  changeSets: ChangeListData[],
  index: number
): string | number | Date => changeSets[index > 0 ? index - 1 : 0].date;

const doesPreviousDateMatch = (
  changeList: ChangeListData,
  combinedAndOrderedChangeSets: ChangeListData[],
  index: number
): boolean =>
  index !== 0 &&
  convertToUIDateFormat(changeList.date) ===
    convertToUIDateFormat(previousDate(combinedAndOrderedChangeSets, index));

const ChangeList: React.FC<ChangeListProps> = ({ data }: ChangeListProps) => {
  const orderedData = orderBy(data, ['date'], ['desc']);
  const { t } = useTranslation();

  if (orderedData.length === 0) {
    return (
      <$MessagesList variant="message">
        <$Empty>
          <IconHistory />
          <p>{t('common:changes.header.noChanges')}</p>
        </$Empty>
      </$MessagesList>
    );
  }

  return (
    <$Actions>
      {orderedData.map((changeSet, index) => (
        <React.Fragment
          key={`${changeSet.date}-${changeSet.reason}-${changeSet.user.name}`}
        >
          {!doesPreviousDateMatch(changeSet, orderedData, index) && (
            <p>{convertToUIDateFormat(changeSet.date)}</p>
          )}
          <ChangeSet data={changeSet} />
        </React.Fragment>
      ))}
    </$Actions>
  );
};
export default ChangeList;
