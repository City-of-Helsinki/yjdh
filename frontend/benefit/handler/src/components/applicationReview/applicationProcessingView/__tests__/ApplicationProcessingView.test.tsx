import { fireEvent, RenderResult, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import renderComponent from 'benefit/handler/__tests__/utils/render-component';
import AppContext, { AppContextType } from 'benefit/handler/context/AppContext';
import { useDetermineAhjoMode } from 'benefit/handler/hooks/useDetermineAhjoMode';
import {
  Application,
  HandledAplication,
} from 'benefit/handler/types/application';
import { extractCalculatorRows } from 'benefit/handler/utils/calculator';
import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import { axe } from 'jest-axe';
import noop from 'lodash/noop';
import React from 'react';
import theme from 'shared/styles/theme';

import ApplicationProcessingView from '../ApplicationProcessingView';

jest.mock('benefit/handler/hooks/useDetermineAhjoMode', () => ({
  useDetermineAhjoMode: jest.fn(),
}));

jest.mock('benefit/handler/utils/calculator', () => ({
  extractCalculatorRows: jest.fn(),
}));

// Finnish labels from public/locales/fi/common.json
const LABEL_REJECT = 'Ei puolleta';
const LABEL_ACCEPT = 'Puolletaan';
const LABEL_DEMINIMIS_YES = 'Helsinki-lisä myönnetään de minimis-tukena';
const LABEL_DEMINIMIS_NO = 'Helsinki-lisä ei ole hakijalle de minimis-tukea';
const LABEL_INDUSTRY_CODE = 'TOL-koodi (toimialaluokitus)';

const mockUseDetermineAhjoMode = useDetermineAhjoMode as jest.MockedFunction<
  typeof useDetermineAhjoMode
>;
const mockExtractCalculatorRows = extractCalculatorRows as jest.MockedFunction<
  typeof extractCalculatorRows
>;

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
      <ApplicationProcessingView data={data as Application} />
    </AppContext.Provider>
  ).renderResult;

describe('ApplicationProcessingView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseDetermineAhjoMode.mockReturnValue(false);
    mockExtractCalculatorRows.mockReturnValue({
      rowsWithoutTotal: [],
      totalRow: undefined,
      totalRowDescription: undefined,
      dateRangeRows: [],
      helsinkiBenefitMonthlyRows: [],
    });
  });

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

    const updater = setHandledApplication.mock.calls.at(-1)?.[0] as (
      prev: HandledAplication
    ) => HandledAplication;
    expect(typeof updater).toBe('function');
    const result = updater(handledApplication);
    expect(result).toMatchObject({
      industryCode: '62010',
      industryDescription: 'Ohjelmistot',
    });
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

  it('initializes handledApplication from decisionProposalDraft in new Ahjo mode', () => {
    mockUseDetermineAhjoMode.mockReturnValue(true);
    const setHandledApplication = jest.fn();

    const data = {
      ...minimalData,
      decisionProposalDraft: {
        status: APPLICATION_STATUSES.ACCEPTED,
        grantedAsDeMinimisAid: true,
        logEntryComment: 'draft comment',
        justificationText: 'justification',
        decisionText: 'decision',
        decisionMakerId: '42',
        decisionMakerName: 'Name',
      },
    };

    getComponent(null, setHandledApplication, data);

    expect(setHandledApplication).toHaveBeenCalledWith(
      expect.objectContaining({
        status: APPLICATION_STATUSES.ACCEPTED,
        grantedAsDeMinimisAid: true,
        logEntryComment: 'draft comment',
        justificationText: 'justification',
        decisionText: 'decision',
        decisionMakerId: '42',
        decisionMakerName: 'Name',
      })
    );
  });

  it('updates status to REJECTED when reject radio is selected', async () => {
    const user = userEvent.setup();
    const setHandledApplication = jest.fn();
    const handledApplication: HandledAplication = {
      status: APPLICATION_STATUSES.ACCEPTED,
      grantedAsDeMinimisAid: true,
      logEntryComment: 'old comment',
    };

    getComponent(handledApplication, setHandledApplication);

    await user.click(screen.getByLabelText(LABEL_REJECT));

    expect(setHandledApplication).toHaveBeenCalledWith(
      expect.objectContaining({
        status: APPLICATION_STATUSES.REJECTED,
        grantedAsDeMinimisAid: false,
        logEntryComment: '',
      })
    );
  });

  it('updates status to ACCEPTED when accept radio is selected', async () => {
    const user = userEvent.setup();
    const setHandledApplication = jest.fn();
    const handledApplication: HandledAplication = {
      status: APPLICATION_STATUSES.REJECTED,
      grantedAsDeMinimisAid: false,
      logEntryComment: 'old comment',
    };

    getComponent(handledApplication, setHandledApplication);

    await user.click(screen.getByLabelText(LABEL_ACCEPT));

    expect(setHandledApplication).toHaveBeenCalledWith(
      expect.objectContaining({
        status: APPLICATION_STATUSES.ACCEPTED,
        logEntryComment: '',
      })
    );
  });

  it('updates rejected comment text via onCommentsChange', () => {
    const setHandledApplication = jest.fn();
    const handledApplication: HandledAplication = {
      status: APPLICATION_STATUSES.REJECTED,
      grantedAsDeMinimisAid: false,
      logEntryComment: '',
    };

    getComponent(handledApplication, setHandledApplication);

    fireEvent.change(screen.getByLabelText(/Perustelu/), {
      target: { value: 'new reject comment' },
    });

    expect(setHandledApplication).toHaveBeenCalledWith(
      expect.objectContaining({ logEntryComment: 'new reject comment' })
    );
  });

  it('updates accepted comment text via onCommentsChange in old Ahjo mode', () => {
    const setHandledApplication = jest.fn();
    const handledApplication: HandledAplication = {
      status: APPLICATION_STATUSES.ACCEPTED,
      grantedAsDeMinimisAid: false,
      logEntryComment: '',
    };

    getComponent(handledApplication, setHandledApplication);

    const acceptedComment = screen.getByLabelText(/Perustelu/);
    fireEvent.change(acceptedComment, {
      target: { value: 'new accept comment' },
    });

    expect(setHandledApplication).toHaveBeenCalledWith(
      expect.objectContaining({ logEntryComment: 'new accept comment' })
    );
  });

  it('toggles grantedAsDeMinimisAid to true from radio button', async () => {
    const user = userEvent.setup();
    const setHandledApplication = jest.fn();
    const handledApplication: HandledAplication = {
      status: APPLICATION_STATUSES.ACCEPTED,
      grantedAsDeMinimisAid: false,
      industryCodeTouched: true,
    };

    getComponent(handledApplication, setHandledApplication);

    await user.click(screen.getByLabelText(LABEL_DEMINIMIS_YES));

    expect(setHandledApplication).toHaveBeenCalledWith(
      expect.objectContaining({
        grantedAsDeMinimisAid: true,
        industryCodeTouched: false,
      })
    );
  });

  it('toggles grantedAsDeMinimisAid to false from radio button', async () => {
    const user = userEvent.setup();
    const setHandledApplication = jest.fn();
    const handledApplication: HandledAplication = {
      status: APPLICATION_STATUSES.ACCEPTED,
      grantedAsDeMinimisAid: true,
      industryCodeTouched: true,
    };

    getComponent(handledApplication, setHandledApplication);

    await user.click(screen.getByLabelText(LABEL_DEMINIMIS_NO));

    expect(setHandledApplication).toHaveBeenCalledWith(
      expect.objectContaining({
        grantedAsDeMinimisAid: false,
        industryCodeTouched: false,
      })
    );
  });

  it('renders calculator total and monthly rows when row lengths match', () => {
    mockExtractCalculatorRows.mockReturnValue({
      rowsWithoutTotal: [],
      totalRow: {
        id: 'total',
        descriptionFi: 'Yhteensä',
        amount: 1200,
      } as never,
      totalRowDescription: {
        descriptionFi: 'Laskelman yhteenveto',
      } as never,
      dateRangeRows: [{ id: 'month-1', descriptionFi: '1.1-31.1' }] as never,
      helsinkiBenefitMonthlyRows: [{ amount: 100 }] as never,
    });

    const handledApplication: HandledAplication = {
      status: APPLICATION_STATUSES.ACCEPTED,
      grantedAsDeMinimisAid: false,
    };

    getComponent(handledApplication);

    expect(screen.getByText('Laskelman yhteenveto')).toBeInTheDocument();
    expect(screen.getByText('Yhteensä')).toBeInTheDocument();
    expect(screen.getByText('1.1-31.1')).toBeInTheDocument();
  });

  it('shows industry code + description as a single input value', () => {
    const handledApplication: HandledAplication = {
      status: APPLICATION_STATUSES.ACCEPTED,
      grantedAsDeMinimisAid: true,
      industryCode: '62010',
      industryDescription: 'Ohjelmistot',
    };
    const data = {
      ...minimalData,
      company: {
        ...minimalData.company,
        industryCode: undefined,
      },
    };

    getComponent(handledApplication, noop, data);

    const input = screen.getByLabelText(LABEL_INDUSTRY_CODE, {
      exact: false,
    });
    expect(input).toHaveValue('62010 Ohjelmistot');
  });

  it('marks industry code as touched on blur', () => {
    const setHandledApplication = jest.fn();
    const handledApplication: HandledAplication = {
      status: APPLICATION_STATUSES.ACCEPTED,
      grantedAsDeMinimisAid: true,
      industryCode: '',
      industryDescription: undefined,
      industryCodeTouched: false,
    };
    const data = {
      ...minimalData,
      company: {
        ...minimalData.company,
        industryCode: undefined,
      },
    };

    getComponent(handledApplication, setHandledApplication, data);

    const input = screen.getByLabelText(LABEL_INDUSTRY_CODE, {
      exact: false,
    });
    fireEvent.blur(input);

    const updater = setHandledApplication.mock.calls.at(-1)?.[0] as (
      prev: HandledAplication
    ) => HandledAplication;

    const updated = updater(handledApplication);
    expect(updated.industryCodeTouched).toBe(true);
  });

  it('parses only code and clears description when no description is provided', () => {
    const setHandledApplication = jest.fn();
    const handledApplication: HandledAplication = {
      status: APPLICATION_STATUSES.ACCEPTED,
      grantedAsDeMinimisAid: true,
      industryCode: '',
      industryDescription: 'old',
    };
    const data = {
      ...minimalData,
      company: {
        ...minimalData.company,
        industryCode: undefined,
      },
    };

    getComponent(handledApplication, setHandledApplication, data);

    const input = screen.getByLabelText(LABEL_INDUSTRY_CODE, {
      exact: false,
    });
    fireEvent.change(input, { target: { value: '62010' } });

    const updater = setHandledApplication.mock.calls.at(-1)?.[0] as (
      prev: HandledAplication
    ) => HandledAplication;
    const updated = updater(handledApplication);

    expect(updated.industryCode).toBe('62010');
    expect(updated.industryDescription).toBeUndefined();
  });
});
