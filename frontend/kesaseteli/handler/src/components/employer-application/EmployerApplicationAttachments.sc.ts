import styled, { DefaultTheme } from 'styled-components';

export const $UploadContainer = styled.div`
  border: 1px solid var(--color-black-10);
  background-color: var(--color-black-5);
  padding: var(--spacing-m);
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  margin-bottom: ${(props: { theme: DefaultTheme }) => props.theme.spacing.l};
`;

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

export const $DragDropArea = styled.div<{ $isDragging: boolean }>`
  border: 2px dashed
    ${({ $isDragging, theme }: { $isDragging: boolean; theme: DefaultTheme }) =>
      $isDragging ? theme.colors.coatOfArms : theme.colors.black50};
  padding: ${(props: { theme: DefaultTheme }) => props.theme.spacing.l};
  text-align: center;
  margin-bottom: ${(props: { theme: DefaultTheme }) => props.theme.spacing.m};
  background-color: ${({
    $isDragging,
    theme,
  }: {
    $isDragging: boolean;
    theme: DefaultTheme;
  }) => ($isDragging ? theme.colors.coatOfArmsLight : theme.colors.white)};
  transition: border-color 0.15s ease, background-color 0.15s ease;
  cursor: pointer;
  border-radius: 4px;
`;

export const $AttachmentTypeGroup = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-m);
  flex-wrap: wrap;
  margin-bottom: ${(props: { theme: DefaultTheme }) => props.theme.spacing.m};

  /* Force HDS elements to reset vertical margins and align centered */
  & > div {
    margin: 0 !important;
    display: inline-flex;
    align-items: center;
  }
`;

export const $PlaceholderInputArea = styled.div`
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

export const $MultiVoucherWarning = styled.div`
  margin-bottom: ${(props: { theme: DefaultTheme }) => props.theme.spacing.m};
  font-size: var(--fontsize-body-m);
  color: ${(props: { theme: DefaultTheme }) => props.theme.colors.black70};
`;

export const $HiddenFileInput = styled.input`
  display: none;
`;
