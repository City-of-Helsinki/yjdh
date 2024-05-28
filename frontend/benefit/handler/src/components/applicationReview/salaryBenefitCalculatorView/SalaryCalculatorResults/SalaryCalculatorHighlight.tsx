import { $Highlight } from 'benefit/handler/components/applicationReview/ApplicationReview.sc';
import React from 'react';
import { formatFloatToCurrency } from 'shared/utils/string.utils';
import { useTheme } from 'styled-components';

type Props = {
  description: string;
  amount: string | number;
  testId?: string;
};

const SalaryCalculatorHighlight: React.FC<Props> = ({
  description,
  amount,
  testId,
}) => {
  const theme = useTheme();

  return (
    <$Highlight data-testid={testId}>
      <div style={{ fontSize: theme.fontSize.body.xl }}>{description}</div>
      <div style={{ fontSize: theme.fontSize.heading.xl }}>
        {formatFloatToCurrency(amount, 'EUR', 'fi-FI', 0)}
      </div>
    </$Highlight>
  );
};

export default SalaryCalculatorHighlight;
