import styled from 'styled-components';

export const $HorizontalList = styled.dl`
  display: flex;
  flex-flow: row wrap;
  align-items: flex-start;
  width: 100%;
  padding: var(--spacing-m) var(--spacing-m) var(--spacing-xs) var(--spacing-m);

  div {
    min-width: 200px;
    max-width: 300px;
    margin-right: auto;
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
`;

export const $TableWrapper = styled.div`
  background: #fff;
  margin-bottom: var(--spacing-l);
`;

export const $TableBody = styled.div``;

export const $HintText = styled.p`
  margin-top: 0;
  margin-bottom: var(--spacing-s);
  flex-basis: 100%;
  margin-top: 0;
  &:empty {
    margin: 0;
  }
`;

export const $TableFooter = styled.footer`
  display: flex;
  flex-flow: row wrap;
  background: #efefef;
  width: 100%;
  padding: var(--spacing-s);
  align-items: center;
  box-sizing: border-box;
`;
