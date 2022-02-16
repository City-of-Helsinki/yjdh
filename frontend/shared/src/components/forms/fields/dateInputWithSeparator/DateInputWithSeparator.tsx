import { DateInput, DateInputProps } from 'hds-react';

const DateInputWithSeparator: React.FC<DateInputProps> = (props) => {
  return (
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
    ></DateInput>
  );
};

export default DateInputWithSeparator;
