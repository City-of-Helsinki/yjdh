import React from 'react';
import { HeaderGroup } from 'react-table';

import {
  $Header,
  $HeaderCell,
  $SortArrow,
  $SortArrowWrapper,
} from './Table.sc';

const renderTableHead = <D extends { id: string }>(
  headerGroup: HeaderGroup<D>
): React.ReactNode => (
  <$Header {...headerGroup.getHeaderGroupProps()}>
    {headerGroup.headers.map((column) => (
      <$HeaderCell {...column.getHeaderProps(column.getSortByToggleProps())}>
        {column.render('Header')}
        {column.canSort && (
          <$SortArrowWrapper>
            <$SortArrow size="xs" />
          </$SortArrowWrapper>
        )}
      </$HeaderCell>
    ))}
  </$Header>
);

export default renderTableHead;
