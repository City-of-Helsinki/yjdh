import { Pagination, Select } from 'hds-react';
import React from 'react';
import LoadingSkeleton from 'react-loading-skeleton';
import Container from 'shared/components/container/Container';
import theme from 'shared/styles/theme';
import { OptionType } from 'shared/types/common';

import {
  $Heading,
  $HeadingContainer,
  $ListWrapper,
  $OrderByContainer,
  $PaginationContainer,
} from './ApplicationList.sc';
import ListItem from './listItem/ListItem';
import useApplicationList from './useApplicationList';

export interface ApplicationListProps {
  heading: ((count: number) => React.ReactNode) | React.ReactNode;
  status: string[];
  isArchived?: boolean;
  clientPaginated?: boolean;
  itemsPerPage?: number;
  initialPage?: number;
  pageHref?: (index: number) => string;
  orderByOptions?: OptionType[];
  noItemsText?: React.ReactNode;
}

const ApplicationsList: React.FC<ApplicationListProps> = ({
  heading,
  status,
  isArchived,
  clientPaginated = false,
  itemsPerPage = 25,
  initialPage,
  orderByOptions,
  noItemsText = '',
}) => {
  const {
    list,
    shouldShowSkeleton,
    shouldHideList,
    currentPage,
    setPage,
    t,
    orderBy,
    setOrderBy,
    language,
  } = useApplicationList({
    status,
    isArchived,
    initialPage: clientPaginated ? initialPage : null,
    orderByOptions,
  });

  if (shouldHideList && !noItemsText) return null;

  const hasItems = list?.length > 0;
  let items =
    list?.map((props) => <ListItem key={props.id} {...props} />) || [];
  if (clientPaginated && !shouldShowSkeleton) {
    items = items.slice(
      currentPage * itemsPerPage,
      (currentPage + 1) * itemsPerPage
    );
  }

  const headingText =
    heading instanceof Function ? heading(list.length) : heading;

  return (
    <Container backgroundColor={theme.colors.silverLight}>
      {shouldShowSkeleton && (
        <>
          <$HeadingContainer>
            <LoadingSkeleton width="20%" />
          </$HeadingContainer>
          <$ListWrapper>
            <ListItem isLoading />
          </$ListWrapper>
        </>
      )}
      {!shouldShowSkeleton && (
        <>
          <$HeadingContainer>
            <$Heading>{headingText}</$Heading>
            <$OrderByContainer>
              {orderByOptions?.length > 1 && (
                <Select<OptionType>
                  id={`application-list-'${status.join('-')}-order-by`}
                  options={orderByOptions}
                  defaultValue={orderBy}
                  onChange={setOrderBy}
                  label={t('common:applications.list.common.sortOrder')}
                  disabled={!hasItems}
                />
              )}
            </$OrderByContainer>
          </$HeadingContainer>
          <$ListWrapper>
            {items}
            {!hasItems && noItemsText}
          </$ListWrapper>
          {hasItems && clientPaginated && (
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
        </>
      )}
    </Container>
  );
};

export default ApplicationsList;
