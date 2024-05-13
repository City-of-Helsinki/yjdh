import {
  $Heading,
  $HeadingContainer,
  $ListWrapper,
  $OrderByContainer,
} from 'benefit/applicant/components/applications/applicationList/ApplicationList.sc';
import ListItem from 'benefit/applicant/components/applications/applicationList/listItem/ListItem';
import { ApplicationListProps } from 'benefit/applicant/components/applications/applicationList/useApplicationList';
import ApplicationListProvider from 'benefit/applicant/context/ApplicationListProvider';
import { Select } from 'hds-react';
import React, { useEffect } from 'react';
import LoadingSkeleton from 'react-loading-skeleton';
import Container from 'shared/components/container/Container';
import theme from 'shared/styles/theme';
import { OptionType } from 'shared/types/common';

interface ListContentProps {
  headingText: React.ReactNode;
  orderByOptions?: OptionType[];
  status: string[];
  items: JSX.Element[];
  noItemsText?: React.ReactNode;
  onListLengthChanged?: (isLoading: boolean, length: number) => void;
  beforeList?: React.ReactNode;
  afterList?: React.ReactNode;
}

type Props = Omit<ApplicationListProps, 'language'> & ListContentProps;

const ListContents = ({
  shouldShowSkeleton,
  shouldHideList,
  headingText,
  orderByOptions,
  orderBy,
  setOrderBy,
  t,
  status,
  noItemsText,
  items,
  hasItems,
  list,
  onListLengthChanged,
  beforeList,
  afterList,
}: Props): JSX.Element => {
  useEffect(() => {
    onListLengthChanged?.(shouldShowSkeleton, list.length);
  }, [shouldShowSkeleton, list.length, onListLengthChanged]);

  if (shouldHideList && !noItemsText) return null;

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
        <ApplicationListProvider list={list} count={list.length}>
          <$HeadingContainer>
            <$Heading>{headingText}</$Heading>
            <$OrderByContainer>
              {orderByOptions?.length > 1 && (
                <Select<OptionType>
                  id={`application-list-${status.join('-')}-order-by`}
                  options={orderByOptions}
                  defaultValue={orderBy}
                  onChange={setOrderBy}
                  label={t('common:applications.list.common.sortOrder')}
                  disabled={!hasItems}
                />
              )}
            </$OrderByContainer>
          </$HeadingContainer>
          {beforeList}
          <$ListWrapper>
            {items}
            {!hasItems && noItemsText}
          </$ListWrapper>
          {afterList}
        </ApplicationListProvider>
      )}
    </Container>
  );
};

export default ListContents;
