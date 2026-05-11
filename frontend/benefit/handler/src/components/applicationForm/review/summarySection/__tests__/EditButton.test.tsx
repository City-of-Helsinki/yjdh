import '@testing-library/jest-dom';

import { act, screen } from '@testing-library/react';
import renderComponent from 'benefit/handler/__tests__/utils/render-component';
import React from 'react';
import { focusAndScroll } from 'shared/utils/dom.utils';

import EditButton from '../EditButton';

jest.mock('shared/utils/dom.utils', () => ({
  focusAndScroll: jest.fn(),
}));

const mockFocusAndScroll = focusAndScroll as jest.MockedFunction<
  typeof focusAndScroll
>;

const dispatchStep = jest.fn();

const renderSubject = (): ReturnType<typeof renderComponent> =>
  renderComponent(
    <EditButton section="company-section" dispatchStep={dispatchStep} />
  );

const getEditButton = (): HTMLElement =>
  screen.getByRole('button', { name: 'Muokkaa' });

describe('EditButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('dispatches setActive action on click', () => {
    renderSubject();

    getEditButton().click();

    expect(dispatchStep).toHaveBeenCalledTimes(1);
    expect(dispatchStep).toHaveBeenCalledWith({
      type: 'setActive',
      payload: 1,
    });
  });

  it('focuses and scrolls to section after timeout', () => {
    jest.useFakeTimers();
    renderSubject();

    getEditButton().click();

    expect(mockFocusAndScroll).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(mockFocusAndScroll).toHaveBeenCalledTimes(1);
    expect(mockFocusAndScroll).toHaveBeenCalledWith('company-section');

    jest.useRealTimers();
  });
});
