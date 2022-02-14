import { IconAngleDown, IconSort } from 'hds-react';
import styled, { css } from 'styled-components';

export const $TableWrapper = styled.div`
  display: block;
`;

export const $Table = styled.div`
  width: 100%;
  table-layout: fixed;
`;

export const $TableCell = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  padding: ${(props) => props.theme.spacing.xs2};
  padding-left: ${(props) => props.theme.spacing.m};
  min-width: ${(props) => props.theme.spacing.s};
  white-space: nowrap;
  text-overflow: ellipsis;
  color: inherit;
  overflow: hidden;
  border-bottom: solid 1px ${(props) => props.theme.colors.black20};
  line-height: ${(props) => props.theme.spacing.l};

  &:last-child {
    border-right: none;
  }
`;

export const $HeaderCell = styled($TableCell)`
  border: none;
  white-space: normal;
  //not implemented
  /*
  .selector,
  .radioSelector {
    display: flex;
    justify-content: center;
    max-width: units(4);
  }

  .expander {
    display: flex;
    justify-content: center;
    max-width: units(6);
  } */
`;

export const $StickyHeaders = styled.div`
  position: sticky;
  top: 0;
  z-index: z-index(table-header);
`;

export const $Header = styled.div`
  background-color: ${(props) => props.theme.colors.coatOfArms};
  color: ${(props) => props.theme.colors.white};
  line-height: ${(props) => props.theme.spacing.l};
  padding: ${(props) => props.theme.spacing.xs4} 0;
  font-weight: 500;
  & > div {
    display: flex;
  }
  //not implemented
  /**
  .mainHeaderReset {
    padding: 0;
    margin: 0;
    border: none;
  }

  .mainHeader {
    background-color: $blue;
    color: $white;
    font-weight: bold;
    border: none;
    text-transform: uppercase;
    margin: 0;
    padding: 0;

    & .tableCell {
      margin: 0;
      padding: units(1);
    }
    
    &.noMainHeader .header {
    top: 0;
  }*/
`;

export const $SortArrowWrapper = styled.div`
  display: inline-flex;
  padding-left: ${(props) => props.theme.spacing.s};
`;

export const $SortArrow = styled(IconSort)`
  transition: transform 0.25s;
`;

interface RowWrapperProps {
  isSelected?: boolean;
}

export const $RowWrapper = styled.div<RowWrapperProps>`
  ${(props) =>
    props.isSelected &&
    css`
      box-shadow: inset 0 0 0 1px ${() => props.theme.colors.coatOfArms};
    `};
`;

export const $SubComponent = styled.div`
  //not implemented
`;

export const $ExpandArrow = styled(IconAngleDown)`
  //not implemented
`;

export const $Link = styled.a`
  color: ${(props) => props.theme.colors.coatOfArms};
  text-decoration: none;
  font-weight: 500;
`;
