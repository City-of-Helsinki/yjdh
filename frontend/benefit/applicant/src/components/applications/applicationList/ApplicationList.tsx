import ListContents from 'benefit/applicant/components/applications/applicationList/listItem/ListContents';
import React, { PropsWithChildren } from 'react';
import { OptionType } from 'shared/types/common';

import ListItem from './listItem/ListItem';
import useApplicationList from './useApplicationList';

export interface ApplicationListProps {
  heading: ((count: number) => React.ReactNode) | React.ReactNode;
  status: string[];
  isArchived?: boolean;
  orderByOptions?: OptionType[];
  noItemsText?: React.ReactNode;
  onListLengthChanged?: (isLoading: boolean, length: number) => void;
}

const ApplicationList: React.FC<PropsWithChildren<ApplicationListProps>> = ({
  heading,
  status,
  isArchived,
  orderByOptions,
  noItemsText,
  children,
  onListLengthChanged,
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

  const items =
    list?.map((props) => <ListItem key={props.id} {...props} />) || [];

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
    >
      {children}
    </ListContents>
  );
};

export default ApplicationList;
