import { fireEvent, RenderResult, screen } from '@testing-library/react';
import renderComponent from 'benefit/handler/__tests__/utils/render-component';
import AppContext, { AppContextType } from 'benefit/handler/context/AppContext';
import { HandledAplication } from 'benefit/handler/types/application';
import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import { axe } from 'jest-axe';
import noop from 'lodash/noop';
import React from 'react';
import theme from 'shared/styles/theme';

import ApplicationProcessingView from '../ApplicationProcessingView';

// Finnish labels from public/locales/fi/common.json
const LABEL_REJECT = 'Ei puolleta';
const LABEL_ACCEPT = 'Puolletaan';
const LABEL_DEMINIMIS_YES = 'Helsinki-lisä myönnetään de minimis-tukena';
const LABEL_DEMINIMIS_NO = 'Helsinki-lisä ei ole hakijalle de minimis-tukea';
const LABEL_INDUSTRY_CODE = 'TOL-koodi (toimialaluokitus)';

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

const buildAppContext = (
  handledApplication: HandledAplication | null,
  setHandledApplication: AppContextType['setHandledApplication'] = noop
): AppContextType => ({
  ...defaultAppContextValue,
  handledApplication,
  setHandledApplication,
});

const minimalData = {
  company: {
    name: 'Test Oy',
    businessId: '1234567-1',
  },
  calculation: { rows: [] },
  decisionProposalDraft: {},
};

const getComponent = (
  handledApplication: HandledAplication | null,
  setHandledApplication: AppContextType['setHandledApplication'] = noop,
  data: Record<string, unknown> = minimalData
): RenderResult =>
  renderComponent(
    <AppContext.Provider
      value={buildAppContext(handledApplication, setHandledApplication)}
    >
      {/* @ts-expect-error: partial application data sufficient for unit testing */}
      <ApplicationProcessingView data={data} />
    </AppContext.Provider>
  ).renderResult;

describe('ApplicationProcessingView', () => {
  it('should render with no accessibility violations when handledApplication is null', async () => {
    const { container } = getComponent(null);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should render accept/reject radio buttons', () => {
    getComponent(null);
    expect(screen.getByLabelText(LABEL_REJECT)).toBeInTheDocument();
    expect(screen.getByLabelText(LABEL_ACCEPT)).toBeInTheDocument();
  });

  it('should show de minimis radio buttons when status is ACCEPTED', () => {
    const handledApplication: HandledAplication = {
      status: APPLICATION_STATUSES.ACCEPTED,
      grantedAsDeMinimisAid: undefined,
    };
    getComponent(handledApplication);
    expect(screen.getByLabelText(LABEL_DEMINIMIS_YES)).toBeInTheDocument();
    expect(screen.getByLabelText(LABEL_DEMINIMIS_NO)).toBeInTheDocument();
  });

  it('should show TOL code input when ACCEPTED + grantedAsDeMinimisAid is true + no company industryCode', () => {
    const handledApplication: HandledAplication = {
      status: APPLICATION_STATUSES.ACCEPTED,
      grantedAsDeMinimisAid: true,
    };
    const data = {
      ...minimalData,
      company: {
        name: 'Test Oy',
        businessId: '1234567-1',
        industryCode: undefined,
      },
    };
    getComponent(handledApplication, noop, data);
    expect(
      screen.queryByLabelText(LABEL_INDUSTRY_CODE, { exact: false })
    ).toBeInTheDocument();
  });

  it('should NOT show TOL code input when company already has industryCode', () => {
    const handledApplication: HandledAplication = {
      status: APPLICATION_STATUSES.ACCEPTED,
      grantedAsDeMinimisAid: true,
    };
    const data = {
      ...minimalData,
      company: {
        name: 'Test Oy',
        businessId: '1234567-1',
        industryCode: '62010',
      },
    };
    getComponent(handledApplication, noop, data);
    expect(
      screen.queryByLabelText(LABEL_INDUSTRY_CODE, { exact: false })
    ).not.toBeInTheDocument();
  });

  it('should parse paste input: first word becomes code, rest becomes description', () => {
    const setHandledApplication = jest.fn();
    const handledApplication: HandledAplication = {
      status: APPLICATION_STATUSES.ACCEPTED,
      grantedAsDeMinimisAid: true,
      industryCode: '',
      industryDescription: undefined,
    };
    const data = {
      ...minimalData,
      company: {
        name: 'Test Oy',
        businessId: '1234567-1',
        industryCode: undefined,
      },
    };
    getComponent(handledApplication, setHandledApplication, data);

    const input = screen.getByLabelText(LABEL_INDUSTRY_CODE, { exact: false });
    expect(input).toBeInTheDocument();

    // Simulate pasting the full TOL code + description at once
    fireEvent.change(input, { target: { value: '62010 Ohjelmistot' } });

    expect(setHandledApplication).toHaveBeenLastCalledWith(
      expect.objectContaining({
        industryCode: '62010',
        industryDescription: 'Ohjelmistot',
      })
    );
  });

  it('should NOT show de minimis section when status is REJECTED', () => {
    const handledApplication: HandledAplication = {
      status: APPLICATION_STATUSES.REJECTED,
      grantedAsDeMinimisAid: false,
    };
    getComponent(handledApplication);
    expect(
      screen.queryByLabelText(LABEL_DEMINIMIS_YES)
    ).not.toBeInTheDocument();
  });
});
