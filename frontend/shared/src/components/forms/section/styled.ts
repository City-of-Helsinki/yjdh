import { Theme } from 'shared/styles/theme';
import styled, { ThemeProps } from 'styled-components';

type Props = ThemeProps<Theme> & { backgroundColor?: string };

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

const StyledSubHeader = styled.h1`
  font-size: ${(props: Props) => props.theme.fontSize.heading.xxs};
  font-weight: 600;
  //margin-bottom: ${(props: Props) => props.theme.spacing.m};
`;

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  font-size: ${(props: Props) => props.theme.fontSize.heading.s};
  font-weight: normal;
  line-height: ${(props: Props) => props.theme.lineHeight.l};
`;

const StyledFormGroup = styled.div<Props>`
  display: flex;
  align-items: center;
  font-size: ${(props: Props) => props.theme.fontSize.body.m};
  margin-bottom: ${(props: Props) => props.theme.spacing.xs};
  & > div {
    margin-right: ${(props: Props) => props.theme.spacing.xs};
  }
  background-color: ${(props: Props) => props.backgroundColor};
`;

const StyledFieldsContainerWithPadding = styled.div`
  display: flex;
  align-items: center;
  padding: ${(props: Props) => props.theme.spacing.xs};
  padding-top: ${(props: Props) => props.theme.spacingLayout.xs2};
  margin-right: 0 !important;
  padding-right: 0;
  & > div {
    width: 250px;
  }
  & > div > div {
    margin-right: ${(props: Props) => props.theme.spacing.xs};
  }
`;

const StyledViewFieldsContainer = styled.div`
  font-size: ${(props: Props) => props.theme.fontSize.body.m};
  display: flex;
  align-items: center;
  padding: ${(props: Props) => props.theme.spacing.xs};
  margin-right: 0 !important;
  padding-right: 0;
  & > div {
    width: 250px;
  }
  & > div > div {
    margin-right: ${(props: Props) => props.theme.spacing.xs};
  }
`;

const StyledViewField = styled.div``;

export {
  StyledContent,
  StyledFieldsContainerWithPadding,
  StyledFormGroup,
  StyledHeader,
  StyledSection,
  StyledSubHeader,
  StyledViewField,
  StyledViewFieldsContainer,
};
