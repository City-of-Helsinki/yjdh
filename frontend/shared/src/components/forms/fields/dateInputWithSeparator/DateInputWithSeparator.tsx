import { DateInput, DateInputProps } from 'hds-react';
import React from 'react';

const DateInputWithSeparator: React.FC<DateInputProps> = (props) => (
  <DateInput
    {...props}
    css={`
      display: flex;
      align-items: center;
      :after {
        margin-left: var(--spacing-s);
        content: '-';
        font-weight: bold;
      }
    `}
  />
);

export default DateInputWithSeparator;
