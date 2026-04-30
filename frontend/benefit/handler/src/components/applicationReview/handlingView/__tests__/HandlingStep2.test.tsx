import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import renderComponent from 'benefit/handler/__tests__/utils/render-component';
import AppContext, { AppContextType } from 'benefit/handler/context/AppContext';
import useDecisionProposalTemplateQuery from 'benefit/handler/hooks/applicationHandling/useDecisionProposalTemplateQuery';
import useAhjoSettingsQuery from 'benefit/handler/hooks/useAhjoSettingsQuery';
import { HandledAplication } from 'benefit/handler/types/application';
import {
  APPLICATION_STATUSES,
  DECISION_TYPES,
} from 'benefit-shared/constants';
import { Application } from 'benefit-shared/types/application';
import React from 'react';

import HandlingStep2 from '../HandlingStep2';

jest.mock('benefit/handler/hooks/applicationHandling/useDecisionProposalTemplateQuery');
jest.mock('benefit/handler/hooks/useAhjoSettingsQuery');

jest.mock('../EditorAhjoProposal', () => {
  const ReactM = jest.requireActual<typeof import('react')>('react');
  return {
    __esModule: true,
    default: ({ name, resetWithContent }: { name: string; resetWithContent: string }) =>
      ReactM.createElement(
        'div',
        {
          'data-testid': `editor-${name}`,
        },
        resetWithContent
      ),
  };
});

const mockUseDecisionProposalTemplateQuery =
  useDecisionProposalTemplateQuery as jest.MockedFunction<
    typeof useDecisionProposalTemplateQuery
  >;
const mockUseAhjoSettingsQuery = useAhjoSettingsQuery as jest.MockedFunction<
  typeof useAhjoSettingsQuery
>;

describe('HandlingStep2', () => {
  const setHandledApplication = jest.fn();

  const baseApplication = {
    id: 'application-id',
    applicantLanguage: 'fi',
    decisionProposalDraft: {
      decisionMakerId: 'draft-decision-maker',
      decisionMakerName: 'Draft role',
      signerId: 'draft-signer-id',
      signerName: 'Draft signer',
    },
  } as unknown as Application;

  const baseHandledApplication: HandledAplication = {
    status: APPLICATION_STATUSES.ACCEPTED,
    decisionText: 'Decision for @role',
    justificationText: 'Justification by @role',
  };

  const decisionMakerOptions = [
    { id: 'decision-maker-1', name: 'Decision maker one' },
    { id: 'decision-maker-2', name: 'Decision maker two' },
  ];

  const signerOptions = [
    { id: 'signer-1', name: 'Signer One' },
    { id: 'signer-2', name: 'Signer Two' },
  ];

  const templateSections = [
    {
      id: 'template-1',
      name: 'Template A',
      template_decision_text: 'Template decision for @role',
      template_justification_text: 'Template justification by @role',
    },
  ];

  const buildContextValue = (
    handledApplication: HandledAplication | null = baseHandledApplication
  ): AppContextType => ({
    isNavigationVisible: false,
    isFooterVisible: true,
    isSidebarVisible: false,
    layoutBackgroundColor: '#ffffff',
    handledApplication,
    setIsNavigationVisible: jest.fn(),
    setIsFooterVisible: jest.fn(),
    setLayoutBackgroundColor: jest.fn(),
    setHandledApplication,
    setIsSidebarVisible: jest.fn(),
  });

  const mockAhjoSettings = (
    options: {
      decisionMakers?: Array<{ id: string; name: string }>;
      signers?: Array<{ id: string; name: string }>;
    } = {}
  ): void => {
    const decisionMakers = options.decisionMakers ?? decisionMakerOptions;
    const signers = options.signers ?? signerOptions;

    mockUseAhjoSettingsQuery.mockImplementation((type) => {
      if (type === 'ahjo_decision_maker') {
        return { data: decisionMakers } as never;
      }
      return { data: signers } as never;
    });
  };

  const renderSubject = (props?: {
    application?: Application;
    handledApplication?: HandledAplication | null;
  }): void => {
    renderComponent(
      <AppContext.Provider value={buildContextValue(props?.handledApplication)}>
        <HandlingStep2 application={props?.application || baseApplication} />
      </AppContext.Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseDecisionProposalTemplateQuery.mockReturnValue({
      isLoading: false,
      data: templateSections,
    } as never);
    mockAhjoSettings();
  });

  it('calls decision proposal template query with accepted decision type', () => {
    renderSubject();

    expect(mockUseDecisionProposalTemplateQuery).toHaveBeenCalledWith(
      'application-id',
      DECISION_TYPES.ACCEPTED
    );
  });

  it('renders loading spinner when templates are loading', () => {
    mockUseDecisionProposalTemplateQuery.mockReturnValue({
      isLoading: true,
      data: undefined,
    } as never);

    renderSubject();

    expect(screen.getByRole('status')).toHaveTextContent('Page is loading');
  });

  it('renders missing content heading with fi fallback when applicant language is en', () => {
    mockUseDecisionProposalTemplateQuery.mockReturnValue({
      isLoading: false,
      data: [],
    } as never);

    renderSubject({
      application: {
        ...baseApplication,
        applicantLanguage: 'en',
      } as Application,
    });

    expect(
      screen.getByText('Myönteiset päätöstekstipohjat puuttuvat kielelle fi.')
    ).toBeInTheDocument();
  });

  it('initializes signer and persists draft signer to handled application once', () => {
    renderSubject();

    expect(setHandledApplication).toHaveBeenCalledWith(
      expect.objectContaining({
        signerId: 'draft-signer-id',
        signerName: 'Draft signer',
      })
    );
    expect(setHandledApplication).toHaveBeenCalledTimes(1);
  });

  it('updates handled application when a signer is selected', async () => {
    const user = userEvent.setup();
    renderSubject();

    setHandledApplication.mockClear();

    await user.click(
      screen.getByRole('radio', {
        name: 'Signer Two',
      })
    );

    expect(setHandledApplication).toHaveBeenCalledWith(
      expect.objectContaining({
        signerId: 'signer-2',
        signerName: 'Signer Two',
      })
    );
  });

  it('updates handled application when a decision maker is selected', async () => {
    const user = userEvent.setup();
    renderSubject();

    await user.click(
      screen.getByRole('radio', {
        name: 'Decision maker two',
      })
    );

    expect(setHandledApplication).toHaveBeenCalledWith(
      expect.objectContaining({
        decisionMakerId: 'decision-maker-2',
        decisionMakerName: 'Decision maker two',
        decisionText: 'Decision for Decision maker two',
        justificationText: 'Justification by Decision maker two',
      })
    );
  });

  it('renders template editor previews when a decision maker is selected', async () => {
    const user = userEvent.setup();
    renderSubject();

    await user.click(
      screen.getByRole('radio', {
        name: 'Decision maker one',
      })
    );

    expect(screen.getByTestId('editor-decisionText')).toHaveTextContent(
      'Decision for Decision maker one'
    );
    expect(screen.getByTestId('editor-justificationText')).toHaveTextContent(
      'Justification by Decision maker one'
    );
  });

  it('updates handled application when a template is selected', async () => {
    const user = userEvent.setup();
    renderSubject();

    await user.click(
      screen.getByRole('radio', {
        name: 'Decision maker one',
      })
    );

    setHandledApplication.mockClear();

    const templateCombobox = screen.getByRole('combobox', {
      name: /päätöstekstipohja/i,
    });
    await user.click(templateCombobox);
    await user.click(screen.getByRole('option', { name: 'Template A' }));

    expect(setHandledApplication).toHaveBeenCalledWith(
      expect.objectContaining({
        decisionText: 'Template decision for Decision maker one',
        justificationText: 'Template justification by Decision maker one',
        decisionMakerId: 'decision-maker-1',
        decisionMakerName: 'Decision maker one',
        signerId: 'draft-signer-id',
        signerName: 'Draft signer',
      })
    );

    expect(screen.getByTestId('editor-decisionText')).toHaveTextContent(
      'Template decision for Decision maker one'
    );
    expect(screen.getByTestId('editor-justificationText')).toHaveTextContent(
      'Template justification by Decision maker one'
    );
  });

  it('does not update handled application from template selection when handledApplication is null', async () => {
    const user = userEvent.setup();
    renderSubject({
      handledApplication: null,
    });

    const templateCombobox = screen.getByRole('combobox', {
      name: /päätöstekstipohja/i,
    });
    await user.click(templateCombobox);
    await user.click(screen.getByRole('option', { name: 'Template A' }));

    expect(setHandledApplication).not.toHaveBeenCalled();
  });
});
