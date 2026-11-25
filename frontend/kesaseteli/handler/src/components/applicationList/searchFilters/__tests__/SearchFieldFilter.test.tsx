import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import renderComponent from 'kesaseteli-shared/__tests__/utils/components/render-component';
import React from 'react';

import SearchFieldFilter from '../SearchFieldFilter';

describe('SearchFieldFilter', () => {
  it('renders input field and search button', () => {
    const handleSearch = jest.fn();
    renderComponent(
      <SearchFieldFilter
        id="test-search-filter"
        onSearch={handleSearch}
      />
    );

    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Hae' })
    ).toBeInTheDocument();
  });

  it('calls onSearch with input text when "Hae" button is clicked', async () => {
    const handleSearch = jest.fn();
    renderComponent(
      <SearchFieldFilter
        id="test-search-filter"
        onSearch={handleSearch}
      />
    );

    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'Matti Meikäläinen');

    const searchButton = screen.getByRole('button', { name: 'Hae' });
    await userEvent.click(searchButton);

    expect(handleSearch).toHaveBeenCalledTimes(1);
    expect(handleSearch).toHaveBeenCalledWith('Matti Meikäläinen');
  });

  it('calls onSearch when Enter key is pressed in the input field', async () => {
    const handleSearch = jest.fn();
    renderComponent(
      <SearchFieldFilter
        id="test-search-filter"
        onSearch={handleSearch}
      />
    );

    const input = screen.getByRole('textbox');
    await userEvent.type(input, '111111-1111{enter}');

    expect(handleSearch).toHaveBeenCalledTimes(1);
    expect(handleSearch).toHaveBeenCalledWith('111111-1111');
  });

  it('initializes with default value if provided via prop', () => {
    const handleSearch = jest.fn();
    renderComponent(
      <SearchFieldFilter
        id="test-search-filter"
        onSearch={handleSearch}
        value="Initial Query"
      />
    );

    expect(screen.getByRole('textbox')).toHaveValue('Initial Query');
  });
});
