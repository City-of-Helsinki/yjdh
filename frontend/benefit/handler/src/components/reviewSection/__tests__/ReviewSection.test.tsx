import '@testing-library/jest-dom';
import '../../../../test/i18n/i18n-test';

import { screen } from '@testing-library/react';
import renderComponent from 'benefit/handler/__tests__/utils/render-component';
import { setupUserAndRender } from 'benefit/handler/__tests__/utils/user-render-helper';
import ReviewStateContext from 'benefit/handler/context/ReviewStateContext';
import { ReviewState } from 'benefit/handler/types/application';
import { NextRouter } from 'next/router';
import React from 'react';

import ReviewSection from '../ReviewSection';

const defaultReviewState: ReviewState = {
  company: false,
  companyContactPerson: false,
  deMinimisAids: false,
  coOperationNegotiations: false,
  employee: false,
  paySubsidy: false,
  benefit: false,
  employment: false,
  approval: false,
};

const renderWithContext = (
  reviewState: ReviewState,
  handleUpdateReviewState: jest.Mock,
  children: React.ReactElement,
  router: Partial<NextRouter> = {}
): void => {
  renderComponent(
    <ReviewStateContext.Provider
      value={{ reviewState, handleUpdateReviewState }}
    >
      {children}
    </ReviewStateContext.Provider>,
    router
  );
};

const getApplicationActionIcon = (): HTMLElement =>
  screen.getByRole('img', {
    name: /vaihda tarkistusmerkinnän tila/i,
  });

describe('ReviewSection handleReviewClick', () => {
  const handleUpdateReviewState = jest.fn();
  const push = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('toggles section state to true when icon is clicked and section is provided', async () => {
    const user = setupUserAndRender(() =>
      renderWithContext(
        defaultReviewState,
        handleUpdateReviewState,
        <ReviewSection action section="employee">
          content
        </ReviewSection>
      )
    );

    await user.click(getApplicationActionIcon());

    expect(handleUpdateReviewState).toHaveBeenCalledTimes(1);
    expect(handleUpdateReviewState).toHaveBeenCalledWith({
      ...defaultReviewState,
      employee: true,
    });
  });

  it('toggles section state to false when icon is clicked and section is already true', async () => {
    const user = setupUserAndRender(() =>
      renderWithContext(
        { ...defaultReviewState, employee: true },
        handleUpdateReviewState,
        <ReviewSection action section="employee">
          content
        </ReviewSection>
      )
    );

    await user.click(getApplicationActionIcon());

    expect(handleUpdateReviewState).toHaveBeenCalledTimes(1);
    expect(handleUpdateReviewState).toHaveBeenCalledWith({
      ...defaultReviewState,
      employee: false,
    });
  });

  it('does not call handleUpdateReviewState when section is not provided', async () => {
    const user = setupUserAndRender(() =>
      renderWithContext(
        defaultReviewState,
        handleUpdateReviewState,
        <ReviewSection action>content</ReviewSection>
      )
    );

    await user.click(getApplicationActionIcon());

    expect(handleUpdateReviewState).not.toHaveBeenCalled();
  });

  it('pushes to application edit route when edit button is clicked', async () => {
    const user = setupUserAndRender(() =>
      renderWithContext(
        defaultReviewState,
        handleUpdateReviewState,
        <ReviewSection action id="application-id">
          content
        </ReviewSection>,
        { push }
      )
    );

    await user.click(screen.getByRole('button', { name: /muokkaa/i }));

    expect(push).toHaveBeenCalledTimes(1);
    expect(push).toHaveBeenCalledWith('/application/edit?id=application-id');
  });
});
