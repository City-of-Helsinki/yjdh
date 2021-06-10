import { screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import React from 'react';
import { StepProps } from 'shared/components/stepper/Step';
import Stepper from 'shared/components/stepper/Stepper';
import theme from 'shared/styles/theme';
import { ThemeProvider } from 'styled-components';
import { render } from 'test-utils';

test('test for accessibility violations', async () => {
  const steps: StepProps[] = [{ title: 'Yritys' }];

  const { container } = render(
    <ThemeProvider theme={theme}>
      <Stepper steps={steps} activeStep={3} />
    </ThemeProvider>
  );
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

test('should show step labels', async () => {
  const steps: StepProps[] = [
    { title: 'Yritys' },
    { title: 'Palkattava' },
    { title: 'Liittet' },
    { title: 'Yhteenveto' },
    { title: 'Valtakirja' },
    { title: 'Lähetä' },
  ];

  render(
    <ThemeProvider theme={theme}>
      <Stepper steps={steps} activeStep={3} />
    </ThemeProvider>
  );

  expect(screen.queryByText(/yritys/i)).toBeInTheDocument();
  expect(screen.queryByText(/palkattava/i)).toBeInTheDocument();
  expect(screen.queryByText(/liittet/i)).toBeInTheDocument();
  expect(screen.queryByText(/yhteenveto/i)).toBeInTheDocument();
  expect(screen.queryByText(/valtakirja/i)).toBeInTheDocument();
  expect(screen.queryByText(/lähetä/i)).toBeInTheDocument();
});
