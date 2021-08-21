import styled from 'styled-components';

export const $TextContainer = styled.div`
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  max-width: 740px;
  margin-bottom: ${(props) => props.theme.spacing.l};
`;

export const $Heading = styled.h1`
  font-size: ${(props) => props.theme.fontSize.heading.m};
  font-weight: 500;
  margin: 0;
`;

export const $Description = styled.p`
  font-size: ${(props) => props.theme.fontSize.heading.s};
  font-weight: normal;
  line-height: ${(props) => props.theme.lineHeight.l};
`;

export const $WarningContainer = styled.div`
  display: flex;
  align-items: center;
  flex: 1 0 30%;
  box-sizing: border-box;
  font-weight: 500;

  svg {
    margin-right: ${(props) => props.theme.spacing.xs2};
  }
`;
