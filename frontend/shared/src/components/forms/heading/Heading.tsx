import { LoadingSpinner, Tooltip } from 'hds-react';
import { useTranslation } from 'next-i18next';
import * as React from 'react';

import { $Header, HeadingProps } from './Heading.sc';

const Heading: React.FC<HeadingProps> = ({
  as,
  size = 'm',
  header,
  loading,
  tooltip,
  'data-testid': dataTestId,
}) => {
  const { t } = useTranslation();
  return (
    <$Header size={size} as={as} data-testid={dataTestId}>
      {header}
      {tooltip && (
        <Tooltip
          buttonLabel={t('common:application.tooltipShowInfo')}
          tooltipLabel={tooltip}
        >
          {tooltip}
        </Tooltip>
      )}
      {loading && <LoadingSpinner small />}
    </$Header>
  );
};

export default Heading;
