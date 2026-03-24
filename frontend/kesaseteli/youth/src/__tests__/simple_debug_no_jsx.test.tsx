import { render, act } from '@testing-library/react';
import React from 'react';

describe('simple-no-jsx', () => {
  it('renders a div with createElement', async () => {
    const element = React.createElement('div', { 'data-testid': 'test-div' }, 'Simple Test');
    // eslint-disable-next-line no-console
    console.log('DEBUG: element structure:', JSON.stringify(element, (key, value) => typeof value === 'function' ? '[Function]' : value));
    
    let result;
    // @ts-ignore
    await act(async () => {
      // @ts-ignore
      result = render(element);
    });
    
    // @ts-ignore
    expect(result.getByText('Simple Test')).toBeInTheDocument();
  });
});
