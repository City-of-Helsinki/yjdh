import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import renderComponent from 'kesaseteli-shared/__tests__/utils/components/render-component';
import React from 'react';

import SearchFieldFilter from '../SearchFieldFilter';

describe('SearchFieldFilter', () => {
  it('renders input field, search button and reset button', () => {
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
    expect(
      screen.getByRole('button', { name: 'Tyhjennä' })
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

  it('clears input field and calls onSearch with empty string when "Tyhjennä" button is clicked', async () => {
    const handleSearch = jest.fn();
    renderComponent(
      <SearchFieldFilter
        id="test-search-filter"
        onSearch={handleSearch}
        value="Initial Query"
      />
    );

    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('Initial Query');

    const resetButton = screen.getByRole('button', { name: 'Tyhjennä' });
    await userEvent.click(resetButton);

    expect(input).toHaveValue('');
    expect(handleSearch).toHaveBeenCalledTimes(1);
    expect(handleSearch).toHaveBeenCalledWith('');
  });

  it('renders custom button texts if provided via props', () => {
    const handleSearch = jest.fn();
    renderComponent(
      <SearchFieldFilter
        id="test-search-filter"
        onSearch={handleSearch}
        buttonText="Custom Search"
        resetButtonText="Custom Reset"
      />
    );

    expect(
      screen.getByRole('button', { name: 'Custom Search' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Custom Reset' })
    ).toBeInTheDocument();
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

  it('renders date inputs when showDateInputs is true and passes dates on search', async () => {
    const handleSearch = jest.fn();
    renderComponent(
      <SearchFieldFilter
        id="test-search-filter"
        onSearch={handleSearch}
        showDateInputs
      />
    );

    const startDateInput = screen.getByRole('textbox', { name: /alkupäivä/i });
    const endDateInput = screen.getByRole('textbox', { name: /loppupäivä/i });
    const searchInput = screen.getByRole('textbox', { name: /haku/i });

    expect(startDateInput).toBeInTheDocument();
    expect(endDateInput).toBeInTheDocument();
    expect(searchInput).toBeInTheDocument();

    await userEvent.type(startDateInput, '1.6.2024');
    await userEvent.type(endDateInput, '30.6.2024');
    await userEvent.type(searchInput, 'Yritys');

    const searchButton = screen.getByRole('button', { name: 'Hae' });
    await userEvent.click(searchButton);

    expect(handleSearch).toHaveBeenCalledTimes(1);
    expect(handleSearch).toHaveBeenCalledWith('Yritys', '1.6.2024', '30.6.2024');
  });

  it('clears date inputs when reset button is clicked', async () => {
    const handleSearch = jest.fn();
    renderComponent(
      <SearchFieldFilter
        id="test-search-filter"
        onSearch={handleSearch}
        showDateInputs
        value="Query"
        startDate="1.6.2024"
        endDate="30.6.2024"
      />
    );

    const startDateInput = screen.getByRole('textbox', { name: /alkupäivä/i });
    const endDateInput = screen.getByRole('textbox', { name: /loppupäivä/i });
    const searchInput = screen.getByRole('textbox', { name: /haku/i });

    expect(startDateInput).toHaveValue('1.6.2024');
    expect(endDateInput).toHaveValue('30.6.2024');
    expect(searchInput).toHaveValue('Query');

    const resetButton = screen.getByRole('button', { name: 'Tyhjennä' });
    await userEvent.click(resetButton);

    expect(startDateInput).toHaveValue('');
    expect(endDateInput).toHaveValue('');
    expect(searchInput).toHaveValue('');
    expect(handleSearch).toHaveBeenCalledTimes(1);
    expect(handleSearch).toHaveBeenCalledWith('', '', '');
  });
});
