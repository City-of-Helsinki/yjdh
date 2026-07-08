import { useTranslation } from 'next-i18next';
import React from 'react';
import {
  $GridCell,
  GridCellProps,
} from 'shared/components/forms/section/FormSection.sc';
import styled, { DefaultTheme } from 'styled-components';

type Props = GridCellProps &
  React.HTMLAttributes<HTMLDivElement> & {
    id?: string;
    type?: string;
    label?: string;
    value?: React.ReactNode;
  };

export const $DescriptionList = styled.dl`
  display: contents;
`;

const $StyledGridCell = styled($GridCell)`
  font-size: ${(props) => props.theme.fontSize.body.l};
`;

const $Label = styled.dt`
  font-size: ${(props: { theme: DefaultTheme }) => props.theme.fontSize.body.m};
  font-weight: 600;
  color: ${(props: { theme: DefaultTheme }) => props.theme.colors.black60};
  margin-bottom: ${(props: { theme: DefaultTheme }) => props.theme.spacing.xs2};
`;

const $Value = styled.dd`
  font-size: ${(props: { theme: DefaultTheme }) => props.theme.fontSize.body.l};
  color: ${(props: { theme: DefaultTheme }) => props.theme.colors.black90};
  margin: 0;
  margin-inline-start: 0;
`;

const Field: React.FC<Props> = ({
  id,
  type,
  label,
  value,
  children,
  ...gridCellProps
}) => {
  const { t } = useTranslation();
  const dataTestId = type ?? id;
  const labelContent = type ? t(`common:handlerApplication.${type}`) : label;

  return (
    <$StyledGridCell
      data-testid={dataTestId && `handlerApplication-${dataTestId}`}
      {...gridCellProps}
    >
      {labelContent && <$Label>{labelContent}</$Label>}
      <$Value>
        {value || '-'}
        {children}
      </$Value>
    </$StyledGridCell>
  );
};

export default Field;
