import { Theme } from 'shared/styles/theme';
import styled, { ThemeProps } from 'styled-components';

type Props = ThemeProps<Theme>;

const StyledSection = styled.div`
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid ${(props: Props) => props.theme.colors.black20};
  padding-bottom: ${(props: Props) => props.theme.spacing.m};
  margin-bottom: ${(props: Props) => props.theme.spacing.s};
`;

const StyledHeader = styled.h1`
  font-size: ${(props: Props) => props.theme.fontSize.heading.m};
  font-weight: 500;
  //margin-bottom: ${(props: Props) => props.theme.spacing.m};
`;

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  font-size: ${(props: Props) => props.theme.fontSize.heading.s};
  font-weight: normal;
  line-height: ${(props: Props) => props.theme.lineHeight.l};
`;

const StyledFormGroup = styled.div`
  display: flex;
  width:100%;
  margin-bottom: ${(props: Props) => props.theme.spacing.xs};
  & > div {
    margin-right: ${(props: Props) => props.theme.spacing.xs};
  }
`;



export { StyledContent, StyledFormGroup,StyledHeader, StyledSection };
