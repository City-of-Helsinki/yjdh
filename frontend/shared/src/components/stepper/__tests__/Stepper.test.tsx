import { axe } from 'jest-axe';
import React from 'react';
import { render, screen } from 'shared/__tests__/utils/test-utils';
import { StepProps } from 'shared/components/stepper/Step';
import Stepper from 'shared/components/stepper/Stepper';
import theme from 'shared/styles/theme';
import { ThemeProvider } from 'styled-components';

test('test for accessibility violations', async () => {
  const steps: StepProps[] = [{ title: 'Työnantaja' }];

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
    { title: 'Työnantaja' },
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

  expect(screen.queryByText(/työnantaja/i)).toBeInTheDocument();
  expect(screen.queryByText(/palkattava/i)).toBeInTheDocument();
  expect(screen.queryByText(/liittet/i)).toBeInTheDocument();
  expect(screen.queryByText(/yhteenveto/i)).toBeInTheDocument();
  expect(screen.queryByText(/valtakirja/i)).toBeInTheDocument();
  expect(screen.queryByText(/lähetä/i)).toBeInTheDocument();
});
