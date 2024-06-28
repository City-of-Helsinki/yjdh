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
  position: relative;
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

    #hds-tag-label span {
      display: flex;
      align-items: center;
      svg {
        margin-right: 2px;
      }
    }
  }
`;

export const $UnreadMessagesCount = styled.div`
  position: absolute;
  text-align: center;
  width: 18px;
  height: 18px;
  line-height: 18px;
  top: -5px;
  right: -11px;
  border-radius: 50%;
  font-size: ${(props) => props.theme.fontSize.body.s};
  font-weight: 300;
  color: ${(props) => props.theme.colors.white};
  background-color: ${(props) => props.theme.colors.coatOfArms};
`;
