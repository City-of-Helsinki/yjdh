import React from 'react';
import { render, screen } from 'shared/__tests__/utils/test-utils';
import Wizard from 'shared/components/wizard/Wizard';

describe('Wizard', () => {
  it('should render first step only', () => {
    render(
      <Wizard>
        <p>step 1</p>
        <p>step 2</p>
      </Wizard>
    );

    expect(screen.queryByText('step 1')).toBeInTheDocument();
    expect(screen.queryByText('step 2')).not.toBeInTheDocument();
  });

  it('should render second step when initial step', () => {
    render(
      <Wizard initialStep={2}>
        <p>step 1</p>
        <p>step 2</p>
      </Wizard>
    );
    expect(screen.queryByText('step 1')).not.toBeInTheDocument();
    expect(screen.queryByText('step 2')).toBeInTheDocument();
  });

  it('should render header and footer', () => {
    render(
      <Wizard header={<p>header</p>} footer={<p>footer</p>}>
        <p>step 1</p>
        <p>step 2</p>
      </Wizard>
    );
    expect(screen.queryByText('header')).toBeInTheDocument();
    expect(screen.queryByText('footer')).toBeInTheDocument();
  });
});
