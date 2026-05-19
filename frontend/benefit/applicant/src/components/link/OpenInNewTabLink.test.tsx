import '@testing-library/jest-dom';

import { render, screen } from '@testing-library/react';
import React from 'react';

import OpenInNewTabLink from './OpenInNewTabLink';

describe('OpenInNewTabLink', () => {
  it('renders children', () => {
    render(<OpenInNewTabLink href="#">Test Link</OpenInNewTabLink>);
    expect(screen.getByText('Test Link')).toBeInTheDocument();
  });

  it('sets aria-label with openInNewTab label if openInNewTab is true', () => {
    render(
      <OpenInNewTabLink href="#" openInNewTab>
        Test Link
      </OpenInNewTabLink>
    );
    expect(
      screen.getByLabelText(/Test Link \(avautuu uudessa välilehdessä\)/)
    ).toBeInTheDocument();
  });

  it('does not append label if openInNewTab is false', () => {
    render(
      <OpenInNewTabLink href="#" openInNewTab={false}>
        Test Link
      </OpenInNewTabLink>
    );
    expect(screen.getByLabelText('Test Link')).toBeInTheDocument();
  });

  it('uses provided aria-label if given', () => {
    render(
      <OpenInNewTabLink href="#" aria-label="Custom label">
        Test Link
      </OpenInNewTabLink>
    );
    expect(screen.getByLabelText('Custom label')).toBeInTheDocument();
  });

  it('uses custom openInNewTabLabel if provided', () => {
    render(
      <OpenInNewTabLink
        href="#"
        openInNewTab
        openInNewTabLabel="(custom label)"
      >
        Test Link
      </OpenInNewTabLink>
    );
    expect(
      screen.getByLabelText(/Test Link \(custom label\)/)
    ).toBeInTheDocument();
  });

  it('handles React element children', () => {
    render(
      <OpenInNewTabLink href="#" openInNewTab>
        <span>Nested Text</span>
      </OpenInNewTabLink>
    );
    expect(
      screen.getByLabelText(/Nested Text \(avautuu uudessa välilehdessä\)/)
    ).toBeInTheDocument();
  });
});
