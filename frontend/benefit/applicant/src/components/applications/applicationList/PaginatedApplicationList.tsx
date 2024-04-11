import { ApplicationListProps } from 'benefit/applicant/components/applications/applicationList/ApplicationList';
import ListContents from 'benefit/applicant/components/applications/applicationList/listItem/ListContents';
import { Pagination } from 'hds-react';
import React, { useState } from 'react';

import { $PaginationContainer } from './ApplicationList.sc';
import ListItem from './listItem/ListItem';
import useApplicationList from './useApplicationList';

export interface PaginatedApplicationListProps {
  itemsPerPage?: number;
  initialPage?: number;
  pageHref?: (index: number) => string;
}

type Props = ApplicationListProps & PaginatedApplicationListProps;

const PaginatedApplicationList: React.FC<Props> = ({
  heading,
  status,
  isArchived,
  itemsPerPage = 25,
  initialPage,
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
    language,
    hasItems,
  } = useApplicationList({
    status,
    isArchived,
    orderByOptions,
  });
  const [currentPage, setPage] = useState<number | null>(initialPage ?? null);

  let items =
    list?.map((props) => <ListItem key={props.id} {...props} />) || [];
  if (!shouldShowSkeleton) {
    items = items.slice(
      currentPage * itemsPerPage,
      (currentPage + 1) * itemsPerPage
    );
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
          {hasItems && (
            <$PaginationContainer>
              <Pagination
                pageHref={() => '#'}
                pageIndex={currentPage}
                pageCount={Math.ceil(list.length / Math.max(1, itemsPerPage))}
                paginationAriaLabel={t('common:utility.pagination')}
                onChange={(e, index) => {
                  e.preventDefault();
                  setPage(index);
                }}
                language={language}
              />
            </$PaginationContainer>
          )}
          {afterList}
        </>
      }
    />
  );
};

export default PaginatedApplicationList;
