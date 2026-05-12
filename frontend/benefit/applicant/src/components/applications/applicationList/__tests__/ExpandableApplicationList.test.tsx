import { screen } from '@testing-library/react';
import renderComponent from 'benefit/applicant/__tests__/utils/render-component';
import { setupUserAndRender } from 'benefit/applicant/__tests__/utils/user-render-helper';
import { ApplicationListProps } from 'benefit/applicant/components/applications/applicationList/ApplicationList';
import ExpandableApplicationList, {
  PaginatedApplicationListProps,
} from 'benefit/applicant/components/applications/applicationList/ExpandableApplicationList';
import React from 'react';

import i18n from '../../../../../test/i18n/i18n-test';
import useApplicationList from '../useApplicationList';

jest.mock(
  'benefit/applicant/components/applications/applicationList/useApplicationList'
);

let mockListContentsProps: Record<string, unknown> = {};

jest.mock(
  'benefit/applicant/components/applications/applicationList/listItem/ListContents',
  () =>
    function ListContentsMock({
      beforeList,
      items,
      afterList,
      ...props
    }: Record<string, unknown>): React.ReactNode {
      mockListContentsProps = props;
      return (
        <div data-testid="list-contents">
          <div data-testid="before-list">{beforeList as React.ReactNode}</div>
          <div data-testid="items">{items as React.ReactNode}</div>
          <div data-testid="after-list">{afterList as React.ReactNode}</div>
        </div>
      );
    }
);

jest.mock(
  'benefit/applicant/components/applications/applicationList/listItem/ListItem',
  () =>
    function ListItemMock({ id }: { id: string }): React.ReactNode {
      return <div data-testid="application-list-item">{id}</div>;
    }
);

const mockUseApplicationList = useApplicationList as jest.Mock;
const t = i18n.t.bind(i18n);
const expandLabel = 'Näytä lisää';
const contractLabel = 'Näytä vähemmän';
const baseList = [{ id: 'item-1' }, { id: 'item-2' }, { id: 'item-3' }];
const orderByOptions = [{ label: 'Uusin ensin', value: '-submitted_at' }];
const orderBy = orderByOptions[0];
const setOrderBy = jest.fn();

const defaultProps: ApplicationListProps & PaginatedApplicationListProps = {
  heading: 'Applications',
  status: ['draft'],
  initialItems: 2,
  orderByOptions,
};

const setupHook = (overrides = {}): void => {
  mockUseApplicationList.mockReturnValue({
    list: baseList,
    shouldShowSkeleton: false,
    shouldHideList: false,
    t,
    orderBy,
    setOrderBy,
    hasItems: true,
    ...overrides,
  });
};

const renderExpandableList = (
  props: Partial<ApplicationListProps & PaginatedApplicationListProps> = {}
): ReturnType<typeof renderComponent> =>
  renderComponent(<ExpandableApplicationList {...defaultProps} {...props} />);

describe('ExpandableApplicationList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockListContentsProps = {};
    setupHook();
  });

  it('shows only initial items and expand button when list is longer than initialItems', () => {
    renderExpandableList();

    expect(screen.getAllByTestId('application-list-item')).toHaveLength(2);
    expect(
      screen.getByRole('button', { name: expandLabel })
    ).toBeInTheDocument();
  });

  it('expands and contracts the list when toggle button is clicked', async () => {
    const user = setupUserAndRender(() => {
      renderExpandableList();
    });

    await user.click(screen.getByRole('button', { name: expandLabel }));

    expect(screen.getAllByTestId('application-list-item')).toHaveLength(3);
    expect(
      screen.getByRole('button', { name: contractLabel })
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: contractLabel }));

    expect(screen.getAllByTestId('application-list-item')).toHaveLength(2);
    expect(
      screen.getByRole('button', { name: expandLabel })
    ).toBeInTheDocument();
  });

  it('does not render expand button when list length does not exceed initialItems', () => {
    setupHook({ list: baseList.slice(0, 2) });

    renderExpandableList();

    expect(screen.getAllByTestId('application-list-item')).toHaveLength(2);
    expect(
      screen.queryByRole('button', { name: expandLabel })
    ).not.toBeInTheDocument();
  });

  it('forwards beforeList and afterList to ListContents', () => {
    renderExpandableList({
      beforeList: <div>Before content</div>,
      afterList: <div>After content</div>,
    });

    expect(screen.getByText('Before content')).toBeInTheDocument();
    expect(screen.getByText('After content')).toBeInTheDocument();
    expect(mockListContentsProps.status).toEqual(['draft']);
    expect(mockListContentsProps.orderByOptions).toEqual(orderByOptions);
  });
});
