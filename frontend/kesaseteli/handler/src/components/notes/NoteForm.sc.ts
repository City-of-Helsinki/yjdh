import { TextArea } from 'hds-react';
import styled, { DefaultTheme } from 'styled-components';

export const $FormContainer = styled.form`
  border: 1px solid var(--color-black-10);
  background-color: var(--color-black-5);
  padding: var(--spacing-m);
  border-radius: 4px;
  display: flex;
  flex-direction: column;
`;

export const $TextArea = styled(TextArea)`
  margin-bottom: var(--spacing-3-xs);

  /* Override HDS input wrapper background so it stays white inside the gray container */
  & > div {
    background-color: var(--color-white);
  }
`;

export const $Toolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-m);
  margin-top: var(--spacing-s);
  flex-wrap: wrap;

  @media (max-width: ${({ theme }: { theme: DefaultTheme }) => theme.breakpoints.m}) {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-s);
  }
`;

export const $OptionsGroup = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-m);
  flex-wrap: wrap;

  /* Force HDS elements to reset vertical margins and align centered */
  & > div {
    margin: 0 !important;
    display: inline-flex;
    align-items: center;
  }

  @media (max-width: ${({ theme }: { theme: DefaultTheme }) => theme.breakpoints.m}) {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-s);

    & > div {
      display: flex;
      width: 100%;
    }
  }
`;

export const $Separator = styled.span`
  display: inline-block;
  width: 1px;
  height: 20px;
  background-color: var(--color-black-30);
  align-self: center;
  margin: 0 var(--spacing-m);

  @media (max-width: ${({ theme }: { theme: DefaultTheme }) => theme.breakpoints.m}) {
    display: none;
  }
`;

export const $FormActions = styled.div`
  display: flex;
  gap: var(--spacing-s);

  @media (max-width: ${({ theme }: { theme: DefaultTheme }) => theme.breakpoints.m}) {
    flex-direction: column-reverse;
    align-items: stretch;
    width: 100%;

    & > * {
      width: 100%;
    }
  }
`;

export const $CharCounter = styled.small<{ $isNearLimit: boolean }>`
  display: block;
  text-align: right;
  color: ${({ $isNearLimit }) =>
    $isNearLimit ? 'var(--color-error)' : 'var(--color-black-60)'};
  font-size: var(--fontsize-body-xs);
`;
