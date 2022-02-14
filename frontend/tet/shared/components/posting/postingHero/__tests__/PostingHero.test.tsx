import { act, fireEvent, render } from '@testing-library/react';
import { fakeTetData } from 'tet/test/mockDataUtils';
import { TetData } from 'tet/shared/types/TetData';

const keywordNames = ['keyword 1', 'keyword 2'];

const getFakeTetData = (overrides?: Partial<TetData>) => {
  return fakeTetData({
    title: 'Kallion Kirjasto',
  });
};

const renderComponent = (props?: Partial<EventHeroProps>) => {
  return render(<EventHero event={getFakeTetData()} {...props} />);
};

test('should render posting title, date and location', () => {
  renderComponent();

  expect(screen.queryByRole('heading', { name })).toBeInTheDocument();
});
