import styled, { DefaultTheme } from 'styled-components';

export const $Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: ${(props: { theme: DefaultTheme }) => props.theme.spacing.m};

  caption {
    /* Visually hidden for screen readers to avoid layout duplication */
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  th,
  td {
    padding: ${(props: { theme: DefaultTheme }) => props.theme.spacing.s};
    border-bottom: 1px solid
      ${(props: { theme: DefaultTheme }) => props.theme.colors.black20};
    text-align: left;
  }

  th {
    font-weight: bold;
  }
`;

export const $PlaceholderArea = styled.div`
  margin-top: ${(props: { theme: DefaultTheme }) => props.theme.spacing.m};
  border: 2px dashed
    ${(props: { theme: DefaultTheme }) => props.theme.colors.black50};
  padding: ${(props: { theme: DefaultTheme }) => props.theme.spacing.l};
  text-align: center;
  margin-bottom: ${(props: { theme: DefaultTheme }) => props.theme.spacing.m};
  background-color: ${(props: { theme: DefaultTheme }) =>
    props.theme.colors.black5};
`;

export const $PlaceholderInputArea = styled.div`
  margin-top: ${(props: { theme: DefaultTheme }) => props.theme.spacing.m};
  margin-bottom: ${(props: { theme: DefaultTheme }) => props.theme.spacing.l};
  display: flex;
  flex-direction: column;
  gap: ${(props: { theme: DefaultTheme }) => props.theme.spacing.xs};

  label {
    font-weight: 500;
  }
`;

export const $TableWrapper = styled.div`
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
`;

export const $AttachmentsContainer = styled.div`
  width: 100%;
  max-width: 100%;
  min-width: 0;
  overflow: hidden;
`;

export const $AttachmentLink = styled.button.attrs({ type: 'button' })`
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  text-align: left;
  color: ${(props: { theme: DefaultTheme }) => props.theme.colors.coatOfArms};
  text-decoration: underline;
  cursor: pointer;

  &:hover {
    color: ${(props: { theme: DefaultTheme }) =>
      props.theme.colors.coatOfArmsDark};
  }
`;
