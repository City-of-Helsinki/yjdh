import FormSection from 'shared/components/forms/section/FormSection';
import styled from 'styled-components';

type CollapsedProps = {
  $isCollapsed: boolean;
};

export const $HorizontalList = styled.dl`
  box-sizing: border-box;
  display: flex;
  flex-flow: row wrap;
  align-items: flex-start;
  justify-content: space-between;
  width: 100%;
  padding: var(--spacing-m) var(--spacing-m) var(--spacing-s) var(--spacing-m);
  margin: 0;

  div {
    min-width: 200px;
    max-width: 300px;
    margin-right: auto;
    &:last-child {
      margin-left: auto;
      margin-right: var(--spacing-m);
      min-width: var(--spacing-l);
      max-width: var(--spacing-l);
    }
  }

  dt,
  dd {
    margin: 0;
    padding: 0;
  }

  dd {
    margin-top: calc(var(--spacing-xs) / 2);
    display: flex;
    align-items: center;
    font-weight: 500;
  }

  button {
    background: transparent;
    border: 0;
    margin: 0;
    padding: var(--spacing-s) var(--spacing-m);
    cursor: pointer;
  }
`;

type TableGridProps = {
  animateClose: boolean;
};
export const $TableGrid = styled.div<TableGridProps>`
  display: grid;
  transition: all 0.65s ease-out;
  grid-template-rows: ${(props) => (props.animateClose ? '0fr' : '1fr')};
  opacity: ${(props) => (props.animateClose ? '0' : '1')};
  margin-bottom: ${(props) => (props.animateClose ? '0' : 'var(--spacing-l)')};
`;

type TableWrapperProps = {
  borderColor: string;
};

export const $TableWrapper = styled.div<TableWrapperProps>`
  overflow-y: hidden;
  background: #fff;
  transition: 0.15s outline ease-in-out;
  outline: 1px solid
    ${(props) => (props.borderColor ? props.borderColor : 'transparent')};
`;

export const $TableBody = styled.div<CollapsedProps>`
  display: ${(props) => (props.$isCollapsed ? 'none' : 'block')};
`;

export const $HintText = styled.p`
  margin-top: 0;
  margin-bottom: var(--spacing-s);
  flex-basis: 100%;
  margin-top: 0;
  &:empty {
    margin: 0;
  }
`;

export const $FormSection = styled(FormSection)`
  margin-bottom: var(--spacing-m);

  + hr {
    display: none;
  }
`;

type $TableFooterProps = {
  backgroundColor?: string;
  borderColor?: string;
};
export const $TableFooter = styled.footer<$TableFooterProps>`
  display: flex;
  flex-flow: row wrap;
  background-color: ${(props) =>
    props.backgroundColor ? props.backgroundColor : '#efefef'};
  width: 100%;
  padding: var(--spacing-m);
  align-items: center;
  box-sizing: border-box;

  form {
    display: grid;
    width: 100%;
  }
`;

export const $TableContainer = styled.div`
  button[data-testid$='-all-button-hds-table-data-testid'] {
    color: var(--color-coat-of-arms);
    border-color: var(--color-coat-of-arms);
    &:hover {
      border-color: var(--color-coat-of-arms);
    }
    &:disabled {
      color: var(--color-black-50);
      border-color: var(--color-black-50);
    }
  }
`;
