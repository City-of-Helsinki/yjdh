import styled from 'styled-components';

type Props = { backgroundColor?: string };

const StyledSection = styled.div`
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid ${(props) => props.theme.colors.black20};
  padding-bottom: ${(props) => props.theme.spacing.m};
  margin-bottom: ${(props) => props.theme.spacing.s};
`;

const StyledHeader = styled.h1`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.s};
  font-size: ${(props) => props.theme.fontSize.heading.m};
  font-weight: 500;
  margin-bottom: ${(props) => props.theme.spacing.l};
`;

const StyledSubHeader = styled.h1`
  font-size: ${(props) => props.theme.fontSize.heading.xxs};
  font-weight: 600;
  //margin-bottom: ${(props) => props.theme.spacing.m};
`;

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  font-size: ${(props) => props.theme.fontSize.heading.s};
  font-weight: normal;
  line-height: ${(props) => props.theme.lineHeight.l};
`;

const StyledFormGroup = styled.div<Props>`
  display: flex;
  align-items: center;
  font-size: ${(props) => props.theme.fontSize.body.m};
  margin-bottom: ${(props) => props.theme.spacing.xs};
  & > div {
    margin-right: ${(props) => props.theme.spacing.xs};
  }
  background-color: ${(props) => props.backgroundColor};
`;

const StyledFieldsContainerWithPadding = styled.div`
  display: flex;
  height: 130px;
  padding-left: var(--spacing-m);
  padding-right: var(--spacing-xs);
  padding-top: ${(props) => props.theme.spacingLayout.xs2};
  margin-right: 0 !important;
  & > div {
    width: 250px;
  }
  & > div > div {
    margin-right: ${(props) => props.theme.spacing.xs};
  }
`;

const StyledViewFieldsContainer = styled.div`
  font-size: ${(props) => props.theme.fontSize.body.m};
  display: flex;
  align-items: center;
  padding: ${(props) => props.theme.spacing.xs};
  margin-right: 0 !important;
  padding-right: 0;
  & > div {
    width: 250px;
  }
  & > div > div {
    margin-right: ${(props) => props.theme.spacing.xs};
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
