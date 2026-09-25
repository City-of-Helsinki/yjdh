import { IconSize, IconSliders } from 'hds-react';
import React from 'react';
import styled, { DefaultTheme } from 'styled-components';

const $FiltersSection = styled.section`
  background-color: ${(props: { theme: DefaultTheme }) =>
    props.theme.colors.busLight};
  padding: ${(props: { theme: DefaultTheme }) => props.theme.spacing.m};
  margin-bottom: ${(props: { theme: DefaultTheme }) => props.theme.spacing.m};
  border: 1px solid
    ${(props: { theme: DefaultTheme }) => props.theme.colors.black10};
  display: flex;
  flex-direction: column;
  gap: ${(props: { theme: DefaultTheme }) => props.theme.spacing.s};
`;

const $FilterTitle = styled.h2`
  font-size: ${(props: { theme: DefaultTheme }) =>
    props.theme.fontSize.heading.xxs};
  margin-top: 0;
  margin-bottom: ${(props: { theme: DefaultTheme }) => props.theme.spacing.s};
  color: ${(props: { theme: DefaultTheme }) => props.theme.colors.black90};
  display: flex;
  align-items: center;
  gap: ${(props: { theme: DefaultTheme }) => props.theme.spacing.xs};
`;

export const $FilterLabel = styled.span`
  display: flex;
  align-items: center;
  gap: ${(props: { theme: DefaultTheme }) => props.theme.spacing.xs};
  font-weight: 500;
  margin-bottom: ${(props: { theme: DefaultTheme }) => props.theme.spacing.xs};
`;

export const $FilterWrapper = styled.div`
  margin-bottom: 1rem;
`;

const $FilterControls = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${(props: { theme: DefaultTheme }) => props.theme.spacing.m};
  flex-wrap: wrap;

  @media (min-width: ${(props: { theme: DefaultTheme }) =>
      props.theme.breakpoints.m}) {
    gap: ${(props: { theme: DefaultTheme }) => props.theme.spacing.xl4};
  }
`;

type FilterSectionProps = {
  ariaLabelledBy: string;
  title: string;
  children: React.ReactNode;
};

const FilterSection: React.FC<FilterSectionProps> = ({
  ariaLabelledBy,
  title,
  children,
}) => (
  <$FiltersSection aria-labelledby={ariaLabelledBy}>
    <$FilterTitle id={ariaLabelledBy}>
      <IconSliders size={IconSize.Small} aria-hidden="true" />
      {title}
    </$FilterTitle>
    <$FilterControls>{children}</$FilterControls>
  </$FiltersSection>
);

export default FilterSection;
