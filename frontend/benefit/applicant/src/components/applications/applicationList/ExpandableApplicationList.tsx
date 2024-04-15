import { ApplicationListProps } from 'benefit/applicant/components/applications/applicationList/ApplicationList';
import ListContents from 'benefit/applicant/components/applications/applicationList/listItem/ListContents';
import { Button } from 'hds-react';
import React, { useState } from 'react';

import { $ListActionButtonContainer } from './ApplicationList.sc';
import ListItem from './listItem/ListItem';
import useApplicationList from './useApplicationList';

export interface PaginatedApplicationListProps {
  initialItems: number;
}

type Props = ApplicationListProps & PaginatedApplicationListProps;

const ExpandableApplicationList: React.FC<Props> = ({
  heading,
  status,
  isArchived,
  initialItems,
  orderByOptions,
  noItemsText,
  onListLengthChanged,
  beforeList,
  afterList,
}) => {
  const {
    list,
    shouldShowSkeleton,
    shouldHideList,
    t,
    orderBy,
    setOrderBy,
    hasItems,
  } = useApplicationList({
    status,
    isArchived,
    orderByOptions,
  });

  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const showExpand = list.length > initialItems;

  let items =
    list?.map((props) => <ListItem key={props.id} {...props} />) || [];
  if (showExpand && !isExpanded) {
    items = items.slice(0, initialItems);
  }

  const headingText =
    heading instanceof Function ? heading(list.length) : heading;

  return (
    <ListContents
      list={list}
      shouldShowSkeleton={shouldShowSkeleton}
      shouldHideList={shouldHideList}
      t={t}
      orderBy={orderBy}
      setOrderBy={setOrderBy}
      orderByOptions={orderByOptions}
      hasItems={hasItems}
      headingText={headingText}
      status={status}
      items={items}
      noItemsText={noItemsText}
      onListLengthChanged={onListLengthChanged}
      beforeList={beforeList}
      afterList={
        <>
          {hasItems && showExpand && (
            <$ListActionButtonContainer>
              <Button
                onClick={() => setIsExpanded(!isExpanded)}
                variant="secondary"
                theme="black"
              >
                {t(
                  isExpanded
                    ? 'common:applications.list.common.contract'
                    : 'common:applications.list.common.expand'
                )}
              </Button>
            </$ListActionButtonContainer>
          )}
          {afterList}
        </>
      }
    />
  );
};

export default ExpandableApplicationList;
