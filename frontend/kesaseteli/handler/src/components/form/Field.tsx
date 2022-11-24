import { useTranslation } from 'next-i18next';
import React from 'react';
import {
  $GridCell,
  GridCellProps,
} from 'shared/components/forms/section/FormSection.sc';
import { useTheme } from 'styled-components';

type Props = GridCellProps & {
  id?: string;
  type?: string;
  value?: string;
  children?: React.ReactNode;
};

const Field: React.FC<Props> = ({
  id,
  type,
  value,
  children,
  ...gridCellProps
}) => {
  const { t } = useTranslation();
  const dataTestId = type ?? id;
  const theme = useTheme();
  return (
    <$GridCell
      data-testid={dataTestId && `handlerApplication-${dataTestId}`}
      css={{ fontSize: theme.fontSize.body.l }}
      {...gridCellProps}
    >
      {type && (
        <>
          <strong>{t(`common:handlerApplication.${type}`)}</strong>:{' '}
        </>
      )}
      {value || '-'}
      {children}
    </$GridCell>
  );
};

export default Field;
