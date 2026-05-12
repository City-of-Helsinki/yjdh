import { screen } from '@testing-library/react';
import renderComponent from 'benefit/applicant/__tests__/utils/render-component';
import { setupUserAndRender } from 'benefit/applicant/__tests__/utils/user-render-helper';
import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import React from 'react';

import i18n from '../../../../../../test/i18n/i18n-test';
import ListContents from '../ListContents';
import ListItem from '../ListItem';

type ListContentsProps = React.ComponentProps<typeof ListContents>;

const t = i18n.t.bind(i18n);

const sortOrderLabelText = 'Järjestä hakemukset';
const headingText = 'Hakemukset';
const noItemsText = 'Ei hakemuksia';
const employeeName = 'Matti Meikalainen';
const multipleOrderByOptions = [
  { label: 'Uusin ensin', value: '-submitted_at' },
  { label: 'Vanhin ensin', value: 'submitted_at' },
];

const listItemData = {
  id: 'application-1',
  name: employeeName,
  contactPersonName: employeeName,
  avatar: { initials: 'MM', color: 'coatOfArms' as const },
  modifiedAt: '01.01.2026',
  submittedAt: '02.01.2026',
  applicationNum: 12_345,
  status: APPLICATION_STATUSES.RECEIVED,
  statusText: 'Käsittelyssä',
  validUntil: '31.12.2026',
  allowedAction: {
    label: 'Muokkaa',
    handleAction: jest.fn(),
  },
  unreadMessagesCount: 0,
};

const defaultProps: ListContentsProps = {
  headingText,
  orderByOptions: [{ label: 'Uusin ensin', value: '-submitted_at' }],
  orderBy: { label: 'Uusin ensin', value: '-submitted_at' },
  setOrderBy: jest.fn(),
  status: ['draft'],
  items: [<ListItem key="item-1" {...listItemData} />],
  noItemsText,
  shouldShowSkeleton: false,
  shouldHideList: false,
  t,
  hasItems: true,
  list: [listItemData],
};

const renderListContents = (
  props: Partial<ListContentsProps> = {}
): ReturnType<typeof renderComponent> =>
  renderComponent(<ListContents {...defaultProps} {...props} />);

describe('ListContents', () => {
  it('renders skeleton state and loading list item when loading', () => {
    renderListContents({ shouldShowSkeleton: true });

    expect(screen.queryByText(headingText)).not.toBeInTheDocument();
    expect(screen.queryByText(employeeName)).not.toBeInTheDocument();
  });

  it('returns null when list should be hidden and no empty-state text exists', () => {
    renderListContents({
      shouldHideList: true,
      noItemsText: undefined,
      beforeList: <div>Ennen listaa</div>,
      afterList: <div>Listan jälkeen</div>,
    });

    expect(screen.queryByText(headingText)).not.toBeInTheDocument();
    expect(screen.queryByText('Ennen listaa')).not.toBeInTheDocument();
    expect(screen.queryByText('Listan jälkeen')).not.toBeInTheDocument();
  });

  it('renders heading, items, and before/after content when not loading', () => {
    renderListContents({
      beforeList: <div>Ennen listaa</div>,
      afterList: <div>Listan jälkeen</div>,
    });

    expect(screen.getByText(headingText)).toBeInTheDocument();
    expect(screen.getByText(employeeName)).toBeInTheDocument();
    expect(screen.getByText('Työllistetty')).toBeInTheDocument();
    expect(screen.getByText('Ennen listaa')).toBeInTheDocument();
    expect(screen.getByText('Listan jälkeen')).toBeInTheDocument();
  });

  it('renders empty-state text when there are no items', () => {
    renderListContents({
      hasItems: false,
      items: [],
      list: [],
    });

    expect(screen.getByText(noItemsText)).toBeInTheDocument();
  });

  it('calls onListLengthChanged with loading flag and list length', () => {
    const onListLengthChanged = jest.fn();

    renderListContents({
      shouldShowSkeleton: true,
      list: [listItemData],
      onListLengthChanged,
    });

    expect(onListLengthChanged).toHaveBeenCalledWith(true, 1);
  });

  it('renders order-by select when there are multiple order options', () => {
    renderListContents({
      orderByOptions: multipleOrderByOptions,
    });

    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('disables order-by select when there are no items', () => {
    renderListContents({
      hasItems: false,
      items: [],
      list: [],
      orderByOptions: multipleOrderByOptions,
    });

    expect(screen.getByText(sortOrderLabelText)).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    expect(screen.getByText(noItemsText)).toBeInTheDocument();
  });

  it('calls setOrderBy with the selected option when order-by selection changes', async () => {
    const setOrderBy = jest.fn();
    const user = setupUserAndRender(() => {
      renderListContents({
        orderByOptions: multipleOrderByOptions,
        orderBy: multipleOrderByOptions[0],
        setOrderBy,
      });
    });

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByText('Vanhin ensin'));

    expect(setOrderBy).toHaveBeenCalledWith(
      expect.objectContaining(multipleOrderByOptions[1])
    );
  });

  it('shows preselected orderBy value in the order-by select', () => {
    renderListContents({
      orderByOptions: multipleOrderByOptions,
      orderBy: multipleOrderByOptions[1],
    });

    expect(screen.getByRole('combobox')).toHaveAccessibleName(
      /1 valittu vaihtoehto: "Vanhin ensin"/
    );
  });
});
