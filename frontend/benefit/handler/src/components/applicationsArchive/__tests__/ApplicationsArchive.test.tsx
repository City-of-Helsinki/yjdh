import { screen, waitFor } from '@testing-library/react';
import renderComponent from 'benefit/handler/__tests__/utils/render-component';
import { setupUserAndRender } from 'benefit/handler/__tests__/utils/user-render-helper';
import { ApplicationData } from 'benefit-shared/types/application';
import * as React from 'react';

import ApplicationsArchive from '../ApplicationsArchive';

jest.mock('hds-react', () => {
  const actual = jest.requireActual('hds-react');

  return {
    ...actual,
    Pagination: ({
      pageIndex,
      pageCount,
      onChange,
    }: {
      pageIndex: number;
      pageCount: number;
      onChange: (
        event: React.MouseEvent<HTMLButtonElement>,
        index: number
      ) => void;
    }) => (
      <nav data-testid="archive-pagination">
        {Array.from({ length: pageCount }, (_, index) => (
          <button
            key={index}
            type="button"
            aria-current={pageIndex === index ? 'page' : undefined}
            onClick={(event) => onChange(event, index)}
          >
            {index + 1}
          </button>
        ))}
      </nav>
    ),
  };
});

jest.mock('benefit/handler/hooks/useSearchApplicationQuery', () =>
  jest.fn(() => ({
    data: {
      matches: [],
      count: 0,
      limit: 30,
      offset: 0,
      next: null,
      previous: null,
    },
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
  count = matches.length,
  limit = 30,
  offset = 0,
  next = null,
  previous = null,
}: {
  isLoading?: boolean;
  matches?: ApplicationData[];
  mutate?: jest.Mock;
  count?: number;
  limit?: number;
  offset?: number;
  next?: string | null;
  previous?: string | null;
} = {}): void => {
  mockUseSearchApplicationQuery.mockReturnValue({
    data: {
      matches,
      count,
      limit,
      offset,
      next,
      previous,
    },
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
      count: 2,
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

    expect(mutate).toHaveBeenCalledWith({
      q: 'yritys',
      limit: 30,
      offset: 0,
    });
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
      expect(mutate).toHaveBeenCalledWith({
        q: '',
        limit: 30,
        offset: 0,
      });
    });
  });

  it('renders pagination when result count exceeds one page', () => {
    setSearchQuery({
      isLoading: false,
      matches: makeApplications(30),
      count: 60,
      next: 'https://localhost:8000/v1/search/?q=&limit=30&offset=30',
    });

    renderSubject();

    expect(screen.getByTestId('archive-pagination')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '1' })).toHaveAttribute(
      'aria-current',
      'page'
    );
    expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument();
  });

  it('does not render pagination when result count fits on one page', () => {
    setSearchQuery({
      isLoading: false,
      matches: makeApplications(10),
      count: 10,
    });

    renderSubject();

    expect(screen.queryByTestId('archive-pagination')).not.toBeInTheDocument();
  });

  it('submits paginated search when page is changed', async () => {
    const mutate = jest.fn();
    const user = setupUserAndRender(() => {
      setSearchQuery({
        isLoading: false,
        matches: makeApplications(30),
        count: 60,
        next: 'https://localhost:8000/v1/search/?q=&limit=30&offset=30',
        mutate,
      });

      renderSubject();
    });

    await user.click(screen.getByRole('button', { name: '2' }));

    expect(mutate).toHaveBeenCalledWith({
      q: '',
      limit: 30,
      offset: 30,
    });
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
