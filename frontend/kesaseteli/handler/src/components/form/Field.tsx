import { useTranslation } from 'next-i18next';
import React from 'react';
import {
  $GridCell,
  GridCellProps,
} from 'shared/components/forms/section/FormSection.sc';
import styled from 'styled-components';

type Props = GridCellProps &
  React.HTMLAttributes<HTMLDivElement> & {
    id?: string;
    type?: string;
    value?: React.ReactNode;
  };

const $StyledGridCell = styled($GridCell)`
  font-size: ${(props) => props.theme.fontSize.body.l};
`;

const Field: React.FC<Props> = ({
  id,
  type,
  value,
  children,
  ...gridCellProps
}) => {
  const { t } = useTranslation();
  const dataTestId = type ?? id;
  return (
    <$StyledGridCell
      data-testid={dataTestId && `handlerApplication-${dataTestId}`}
      {...gridCellProps}
    >
      {type && (
        <>
          <strong>{t(`common:handlerApplication.${type}`)}</strong>:{' '}
        </>
      )}
      {value || '-'}
      {children}
    </$StyledGridCell>
  );
};

export default Field;
