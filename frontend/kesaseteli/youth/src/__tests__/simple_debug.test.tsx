import { render, act } from '@testing-library/react';
import React from 'react';

describe('simple', () => {
  it('renders a div', async () => {
    const element = <div>Simple Test</div>;
    // eslint-disable-next-line no-console
    console.log('DEBUG: element:', element);
    // eslint-disable-next-line no-console
    console.log('DEBUG: element type:', typeof element);
    
    let result;
    await act(async () => {
      result = render(element);
    });
    
    // @ts-ignore
    expect(result.getByText('Simple Test')).toBeInTheDocument();
  });
});
