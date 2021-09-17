import styled from 'styled-components';

export const $Container = styled.div`
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  margin-bottom: ${(props) => props.theme.spacing.m};
  background-color: ${(props) => props.theme.colors.silverLight};
  padding: ${(props) => props.theme.spacing.l};
  padding-top: ${(props) => props.theme.spacing.s};
`;

export const $Heading = styled.p`
  font-size: ${(props) => props.theme.fontSize.heading.m};
  font-weight: 400;
  margin: ${(props) => props.theme.spacing.s} 0;
`;

export const $IconContainer = styled.span`
  svg {
    font-size: ${(props) => props.theme.fontSize.body.m};
  }

  margin-bottom: ${(props) => props.theme.spacing.s};
`;

export const $Description = styled.p`
  font-size: ${(props) => props.theme.fontSize.body.m};
  margin-bottom: ${(props) => props.theme.spacing.l};
`;

export const $ActionsContainer = styled.div`
  display: flex;
`;
