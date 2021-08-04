import $ from 'styled-components';

type Props = { backgroundColor?: string };

const $Section = $.div`
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid ${(props) => props.theme.colors.black20};
  padding-bottom: ${(props) => props.theme.spacing.m};
  margin-bottom: ${(props) => props.theme.spacing.s};
`;

const $Header = $.h1`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.s};
  font-size: ${(props) => props.theme.fontSize.heading.m};
  font-weight: 500;
  margin-bottom: ${(props) => props.theme.spacing.l};
`;

const $SubHeader = $.h1`
  font-size: ${(props) => props.theme.fontSize.heading.xxs};
  font-weight: 600;
  //margin-bottom: ${(props) => props.theme.spacing.m};
`;

const $Content = $.div`
  display: flex;
  flex-direction: column;
  font-size: ${(props) => props.theme.fontSize.heading.s};
  font-weight: normal;
  line-height: ${(props) => props.theme.lineHeight.l};
`;

const $FormGroup = $.div<Props>`
  display: flex;
  align-items: center;
  font-size: ${(props) => props.theme.fontSize.body.m};
  margin-bottom: ${(props) => props.theme.spacing.xs};
  & > div {
    margin-right: ${(props) => props.theme.spacing.xs};
  }
  background-color: ${(props) => props.backgroundColor};
`;

const $FieldsContainerWithPadding = $.div`
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

const $ViewFieldsContainer = $.div`
  font-size: ${(props) => props.theme.fontSize.body.m};
  display: flex;
  align-items: center;
  padding: ${(props) => props.theme.spacing.xs};
  margin-right: 0 !important;
  padding-right: 0;
  & > div {
    width: 240px;
    margin-left: ${(props) => props.theme.spacing.xs};
  }
  & > div > div {
    margin-right: ${(props) => props.theme.spacing.xs};
  }
  width: 100%;
`;

const $ViewField = $.div``;

export {
  $Content,
  $FieldsContainerWithPadding,
  $FormGroup,
  $Header,
  $Section,
  $SubHeader,
  $ViewField,
  $ViewFieldsContainer,
};
