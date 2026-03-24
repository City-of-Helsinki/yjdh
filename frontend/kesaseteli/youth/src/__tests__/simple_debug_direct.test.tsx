import { createRoot } from 'react-dom/client';
import React from 'react';
import { act } from 'react';

describe('react-dom-client', () => {
  it('renders a div', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    await act(async () => {
      root.render(<div>Direct Render</div>);
    });
    expect(container.textContent).toBe('Direct Render');
  });
});
