import { screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import renderComponent from 'kesaseteli-shared/__tests__/utils/components/render-component';
import React from 'react';

import Footer from '../Footer';

describe('Footer', () => {
  it('renders footer contents and has no accessibility violations', async () => {
    renderComponent(<Footer />);
    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeInTheDocument();
    expect(screen.getByText(/helsingin kaupunki/i)).toBeInTheDocument();
    expect(await axe(footer)).toHaveNoViolations();
  });
});
