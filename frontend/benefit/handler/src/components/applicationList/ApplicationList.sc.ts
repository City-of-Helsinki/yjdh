import styled from 'styled-components';

export const $Heading = styled.h2`
  margin-top: var(--spacing-xl);
`;

export const $Empty = styled.div`
  background-color: ${(props) => props.theme.colors.black5};
  color: ${(props) => props.theme.colors.black50};
  padding: ${(props) => props.theme.spacing.s};
`;

export const $EmptyHeading = styled.h2`
  font-weight: 400;
`;

export const $CellContent = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${(props) => props.theme.colors.white};
`;

type TagWrapperProps = {
  $colors: {
    background: string;
    text: string;
  };
};

export const $TagWrapper = styled.div<TagWrapperProps>`
  #hds-tag {
    background: ${(props) => props.$colors.background};
    color: ${(props) => props.$colors.text};
  }
`;
