import { screen, waitFor } from '@testing-library/react';
import renderComponent from 'benefit/handler/__tests__/utils/render-component';
import { setupUserAndRender } from 'benefit/handler/__tests__/utils/user-render-helper';
import { ApplicationData } from 'benefit-shared/types/application';
import * as React from 'react';
import { focusAndScrollToSelector } from 'shared/utils/dom.utils';

import ApplicationsArchive from '../ApplicationsArchive';

jest.mock('benefit/handler/hooks/useSearchApplicationQuery', () =>
  jest.fn(() => ({
    data: { matches: [] },
    isLoading: false,
    error: null,
    mutate: jest.fn(),
  }))
);

jest.mock('shared/utils/dom.utils', () => ({
  focusAndScrollToSelector: jest.fn(),
}));

const mockUseSearchApplicationQuery = jest.requireMock(
  'benefit/handler/hooks/useSearchApplicationQuery'
);
const mockFocusAndScrollToSelector =
  focusAndScrollToSelector as jest.MockedFunction<
    typeof focusAndScrollToSelector
  >;

const makeApplication = ({
  id,
  companyName,
}: {
  id: string;
  companyName: string;
}): ApplicationData =>
  ({
    id,
    companyName,
  } as unknown as ApplicationData);

const makeApplications = (count: number): ApplicationData[] =>
  Array.from({ length: count }, (_, index) =>
    makeApplication({
      id: `a${String(index)}`,
      companyName: `Company ${String(index)}`,
    })
  );

const setSearchQuery = ({
  isLoading = false,
  matches = [],
  mutate = jest.fn(),
}: {
  isLoading?: boolean;
  matches?: ApplicationData[];
  mutate?: jest.Mock;
} = {}): void => {
  mockUseSearchApplicationQuery.mockReturnValue({
    data: { matches },
    isLoading,
    error: null,
    mutate,
  });
};

const renderSubject = ({ appNo }: { appNo?: string } = {}): void => {
  renderComponent(<ApplicationsArchive />, {
    isReady: true,
    query: appNo ? { appNo } : {},
  } as never);
};

describe('ApplicationsArchive', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setSearchQuery();
  });

  it('renders heading, search and archive list', async () => {
    setSearchQuery({
      matches: [
        makeApplication({ id: 'a1', companyName: 'Company A' }),
        makeApplication({ id: 'a2', companyName: 'Company B' }),
      ],
    });

    renderSubject();

    expect(
      screen.getByRole('heading', { name: 'Arkisto' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('searchbox', { name: 'Etsi hakemusta' })
    ).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('submits search when search is sent', async () => {
    const mutate = jest.fn();
    setSearchQuery({ mutate });
    const user = setupUserAndRender(() => renderSubject());

    await user.type(
      screen.getByRole('searchbox', {
        name: 'Etsi hakemusta',
      }),
      'yritys'
    );
    await user.click(screen.getByRole('button', { name: 'Hae' }));

    expect(mutate).toHaveBeenCalledWith('yritys');
  });

  it('renders application number status label and hides search when appNo is provided', () => {
    renderSubject({ appNo: '42' });

    expect(
      screen.queryByRole('searchbox', { name: 'Etsi hakemusta' })
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(
        /Haetaan aiempia tyosuhteita hakemuksen|Haetaan aiempia työsuhteita hakemuksen/
      )
    ).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('resets filters on initial appNo query (useEffect initialQuery branch)', () => {
    renderSubject({ appNo: '42' });

    expect(screen.getByRole('radio', { name: 'Ei rajausta' })).toBeChecked();
    expect(
      screen.getByRole('radio', { name: 'Tukiaika päättynyt 3v sisällä' })
    ).not.toBeChecked();
  });

  it('submits search when loading is false (useEffect submit branch)', async () => {
    const mutate = jest.fn();
    setSearchQuery({
      isLoading: false,
      mutate,
    });

    renderSubject();

    await waitFor(() => {
      expect(mutate).toHaveBeenCalledWith('');
    });
  });

  it('shows load more button at default search and loads all when clicked', async () => {
    const user = setupUserAndRender(() => {
      setSearchQuery({
        isLoading: false,
        matches: makeApplications(30),
      });

      renderSubject();
    });

    const loadMoreButton = screen.getByRole('button', {
      name: 'Lataa lisää',
    });
    expect(loadMoreButton).toBeInTheDocument();

    await user.click(loadMoreButton);

    expect(mockFocusAndScrollToSelector).toHaveBeenCalledWith('header');
    expect(
      screen.queryByRole('button', { name: 'Lataa lisää' })
    ).not.toBeInTheDocument();
  });

  it.each([
    {
      label: 'Tukiaika voimassa',
      initiallyChecked: false,
    },
    {
      label: 'Päätös tehty 3v sisällä',
      initiallyChecked: false,
    },
    {
      label: 'Tukiaika päättynyt 3v sisällä',
      initiallyChecked: true,
    },
  ])(
    'updates "$label" filter when clicked',
    async ({ label, initiallyChecked }) => {
      const user = setupUserAndRender(() => renderSubject());

      const filterRadio = screen.getByRole('radio', {
        name: label,
      });

      if (initiallyChecked) {
        expect(filterRadio).toBeChecked();
      } else {
        expect(filterRadio).not.toBeChecked();
      }

      await user.click(filterRadio);
      expect(filterRadio).toBeChecked();
    }
  );

  it('clears all filters when no filter option is clicked', async () => {
    const user = setupUserAndRender(() => renderSubject());

    const subsidyNowRadio = screen.getByRole('radio', {
      name: 'Tukiaika voimassa',
    });
    await user.click(subsidyNowRadio);
    expect(subsidyNowRadio).toBeChecked();

    const noFilterRadio = screen.getByRole('radio', {
      name: 'Ei rajausta',
    });
    expect(noFilterRadio).not.toBeChecked();
    await user.click(noFilterRadio);

    expect(noFilterRadio).toBeChecked();
    expect(subsidyNowRadio).not.toBeChecked();
  });
});
