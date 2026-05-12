jest.mock('hds-react', () => {
  const actual = jest.requireActual('hds-react');
  const ReactLocal = jest.requireActual('react');

  return {
    ...actual,
    DateInput: ({
      label,
      onBlur,
      onChange,
      value,
    }: {
      label: string;
      onBlur: (event: React.FocusEvent<HTMLInputElement>) => void;
      onChange: (nextValue: string) => void;
      value?: string;
    }) =>
      ReactLocal.createElement('input', {
        'aria-label': label,
        onBlur,
        onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
          onChange(event.target.value),
        value: value ?? '',
      }),
  };
});

export {};
