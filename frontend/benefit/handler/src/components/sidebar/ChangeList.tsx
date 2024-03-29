import { ApplicationChangesData } from 'benefit/handler/types/application';
import { ChangeListData } from 'benefit/handler/types/changes';
import orderBy from 'lodash/orderBy';
import * as React from 'react';
import { $Actions } from 'shared/components/messaging/Messaging.sc';
import { convertToUIDateFormat } from 'shared/utils/date.utils';

import ChangeSet from './ChangeSet';

type ChangeListProps = {
  data: ApplicationChangesData;
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
  const { handler, applicant } = data;
  const combined: ChangeListData[] = [...handler, ...applicant];
  const combinedAndOrderedChangeSets = orderBy(combined, ['date'], ['desc']);

  return (
    <$Actions>
      {combinedAndOrderedChangeSets.map((changeSet, index) => (
        <>
          {!doesPreviousDateMatch(
            changeSet,
            combinedAndOrderedChangeSets,
            index
          ) && <p>{convertToUIDateFormat(changeSet.date)}</p>}
          <ChangeSet
            key={`${changeSet.date}-${changeSet.reason}-${changeSet.user}`}
            data={changeSet}
          />
        </>
      ))}
    </$Actions>
  );
};
export default ChangeList;
