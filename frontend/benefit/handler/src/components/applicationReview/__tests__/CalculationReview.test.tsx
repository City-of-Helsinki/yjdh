import { screen } from '@testing-library/react';
import renderComponent from 'benefit/handler/__tests__/utils/render-component';
import AppContext, { AppContextType } from 'benefit/handler/context/AppContext';
import { HandledAplication } from 'benefit/handler/types/application';
import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import { Application } from 'benefit-shared/types/application';
import { axe } from 'jest-axe';
import noop from 'lodash/noop';
import React from 'react';
import theme from 'shared/styles/theme';

import CalculationReview from '../CalculationReview';

const defaultAppContextValue: AppContextType = {
  isNavigationVisible: false,
  isFooterVisible: true,
  isSidebarVisible: false,
  layoutBackgroundColor: theme.colors.white,
  handledApplication: null,
  setIsNavigationVisible: noop,
  setIsFooterVisible: noop,
  setLayoutBackgroundColor: noop,
  setHandledApplication: noop,
  setIsSidebarVisible: noop,
};

const buildApplication = (overrides: Partial<Application> = {}): Application =>
  ({
    company: { name: 'Test Oy', businessId: '1234567-1' },
    employee: { firstName: 'Maija', lastName: 'Meikäläinen' },
    calculation: { rows: [] },
    decisionProposalDraft: {
      status: APPLICATION_STATUSES.ACCEPTED,
      grantedAsDeMinimisAid: true,
    },
    ...overrides,
  } as unknown as Application);

const getComponent = (
  application: Application,
  handledApplication: HandledAplication | null
): ReturnType<typeof renderComponent>['renderResult'] =>
  renderComponent(
    <AppContext.Provider
      value={{ ...defaultAppContextValue, handledApplication }}
    >
      <CalculationReview application={application} />
    </AppContext.Provider>
  ).renderResult;

describe('CalculationReview', () => {
  it('should render with no accessibility violations', async () => {
    const application = buildApplication();
    const { container } = getComponent(application, null);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should return null when decisionProposalDraft is missing', () => {
    const application = buildApplication({ decisionProposalDraft: undefined });
    const { container } = getComponent(application, null);
    expect(container).toBeEmptyDOMElement();
  });

  it('should show industryCode row when grantedAsDeMinimisAid is true and handledApplication has industryCode', () => {
    const application = buildApplication();
    const handledApplication: HandledAplication = {
      status: APPLICATION_STATUSES.ACCEPTED,
      grantedAsDeMinimisAid: true,
      industryCode: '62010',
    };
    getComponent(application, handledApplication);
    expect(screen.getByText('62010')).toBeInTheDocument();
  });

  it('should show industryCode from company when handledApplication has none', () => {
    const application = buildApplication({
      company: {
        name: 'Test Oy',
        businessId: '1234567-1',
        industryCode: '47111',
      } as Application['company'],
    });
    const handledApplication: HandledAplication = {
      status: APPLICATION_STATUSES.ACCEPTED,
      grantedAsDeMinimisAid: true,
    };
    getComponent(application, handledApplication);
    expect(screen.getByText('47111')).toBeInTheDocument();
  });

  it('should NOT show industryCode row when grantedAsDeMinimisAid is false', () => {
    const application = buildApplication({
      decisionProposalDraft: {
        status: APPLICATION_STATUSES.ACCEPTED,
        grantedAsDeMinimisAid: false,
      },
    });
    const handledApplication: HandledAplication = {
      status: APPLICATION_STATUSES.ACCEPTED,
      grantedAsDeMinimisAid: false,
      industryCode: '62010',
    };
    getComponent(application, handledApplication);
    // industryCode row should not appear when grantedAsDeMinimisAid is false
    expect(screen.queryByText('62010')).not.toBeInTheDocument();
  });

  it('should show REJECTED text when status is REJECTED', () => {
    const application = buildApplication({
      decisionProposalDraft: {
        status: APPLICATION_STATUSES.REJECTED,
        grantedAsDeMinimisAid: false,
      },
    });
    const handledApplication: HandledAplication = {
      status: APPLICATION_STATUSES.REJECTED,
    };
    getComponent(application, handledApplication);
    // employee name shows in rejected view
    expect(screen.getByText('Maija Meikäläinen')).toBeInTheDocument();
  });
});
