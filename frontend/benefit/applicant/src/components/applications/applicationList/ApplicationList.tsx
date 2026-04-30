import ListContents from 'benefit/applicant/components/applications/applicationList/listItem/ListContents';
import React from 'react';
import { OptionType } from 'shared/types/common';

import ListItem from './listItem/ListItem';
import SecondInstalmentListItem from './listItem/SecondInstalmentListItem';
import useApplicationList from './useApplicationList';

export interface ApplicationListProps {
  heading: React.ReactNode;
  status: string[];
  isArchived?: boolean;
  orderByOptions?: OptionType[];
  noItemsText?: React.ReactNode;
  onListLengthChanged?: (isLoading: boolean, length: number) => void;
  beforeList?: React.ReactNode;
  afterList?: React.ReactNode;
  secondInstalmentStatus?: string;
}

const ApplicationList: React.FC<ApplicationListProps> = ({
                                                           heading,
                                                           status,
                                                           isArchived,
                                                           orderByOptions,
                                                           noItemsText,
                                                           onListLengthChanged,
                                                           beforeList,
                                                           afterList,
                                                           secondInstalmentStatus,
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
    secondInstalmentStatus,
  });

  const items =
    list?.map((props) =>
      secondInstalmentStatus ? (
        <SecondInstalmentListItem key={props.id} {...props} />
      ) : (
        <ListItem key={props.id} {...props} />
      )
    ) || [];

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
      headingText={heading}
      status={status}
      items={items}
      noItemsText={noItemsText}
      onListLengthChanged={onListLengthChanged}
      beforeList={beforeList}
      afterList={afterList}
    />
  );
};

export default ApplicationList;
