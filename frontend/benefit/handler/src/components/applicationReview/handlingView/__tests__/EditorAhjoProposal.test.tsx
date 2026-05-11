import '@testing-library/jest-dom';

import { screen } from '@testing-library/react';
import { useEditor } from '@tiptap/react';
import renderComponent from 'benefit/handler/__tests__/utils/render-component';
import { setupUserAndRender } from 'benefit/handler/__tests__/utils/user-render-helper';
import AppContext, { AppContextType } from 'benefit/handler/context/AppContext';
import { HandledAplication } from 'benefit/handler/types/application';
import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import React from 'react';

import EditorAhjoProposal from '../EditorAhjoProposal';

jest.mock('@tiptap/react', () => {
  const ReactM = jest.requireActual<typeof import('react')>('react');
  return {
    EditorContent: () =>
      ReactM.createElement('div', { 'data-testid': 'editor-content' }),
    useEditor: jest.fn(),
  };
});

type MockEditor = {
  commands: {
    setContent: jest.Mock;
  };
  chain: jest.Mock;
  can: jest.Mock;
  isActive: jest.Mock;
  on: jest.Mock;
  getHTML: jest.Mock;
  toggleHeading: jest.Mock;
  undo: jest.Mock;
  redo: jest.Mock;
};

const mockUseEditor = useEditor as jest.MockedFunction<typeof useEditor>;

const createMockEditor = (options?: {
  isHeadingActive?: boolean;
  canUndo?: boolean;
  canRedo?: boolean;
  html?: string;
}): MockEditor => {
  const runHeading = jest.fn();
  const runUndo = jest.fn();
  const runRedo = jest.fn();

  const toggleHeading = jest.fn(() => ({ run: runHeading }));
  const undo = jest.fn(() => ({ run: runUndo }));
  const redo = jest.fn(() => ({ run: runRedo }));

  const focus = jest.fn(() => ({
    toggleHeading,
    undo,
    redo,
  }));

  return {
    commands: {
      setContent: jest.fn(),
    },
    chain: jest.fn(() => ({ focus })),
    can: jest.fn(() => ({
      undo: jest.fn(() => options?.canUndo ?? true),
      redo: jest.fn(() => options?.canRedo ?? true),
    })),
    isActive: jest.fn(() => options?.isHeadingActive ?? false),
    on: jest.fn(),
    getHTML: jest.fn(() => options?.html ?? '<p>Updated text</p>'),
    toggleHeading,
    undo,
    redo,
  };
};

const setHandledApplication = jest.fn();

const buildContextValue = (
  handledApplication?: HandledAplication | null
): AppContextType => ({
  isNavigationVisible: false,
  isFooterVisible: true,
  isSidebarVisible: false,
  layoutBackgroundColor: '#ffffff',
  handledApplication: handledApplication ?? {
    status: APPLICATION_STATUSES.HANDLING,
    decisionText: 'Old decision',
    justificationText: 'Old justification',
  },
  setIsNavigationVisible: jest.fn(),
  setIsFooterVisible: jest.fn(),
  setLayoutBackgroundColor: jest.fn(),
  setHandledApplication,
  setIsSidebarVisible: jest.fn(),
});

const renderSubject = (props?: {
  resetWithContent?: string;
  name?: 'decisionText' | 'justificationText';
  handledApplication?: HandledAplication | null;
}): ReturnType<typeof renderComponent> =>
  renderComponent(
    <AppContext.Provider value={buildContextValue(props?.handledApplication)}>
      <EditorAhjoProposal
        name={props?.name ?? 'decisionText'}
        resetWithContent={props?.resetWithContent}
      />
    </AppContext.Provider>
  );

describe('EditorAhjoProposal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when editor is not available', () => {
    mockUseEditor.mockReturnValue(null);

    renderSubject();

    expect(screen.queryByTestId('decisionText')).not.toBeInTheDocument();
  });

  it('resets editor content when resetWithContent is provided', () => {
    const editor = createMockEditor();
    mockUseEditor.mockReturnValue(editor as never);

    renderSubject({ resetWithContent: '<p>Template content</p>' });

    expect(editor.commands.setContent).toHaveBeenCalledWith(
      '<p>Template content</p>'
    );
  });

  it('updates handled application on editor update event', () => {
    const editor = createMockEditor({ html: '<p>Updated decision</p>' });
    mockUseEditor.mockReturnValue(editor as never);

    renderSubject({ name: 'decisionText' });

    expect(editor.on).toHaveBeenCalledWith('update', expect.any(Function));

    const updateCallback = editor.on.mock.calls[0][1] as () => void;
    updateCallback();

    expect(setHandledApplication).toHaveBeenCalledWith(
      expect.objectContaining({
        decisionText: '<p>Updated decision</p>',
        justificationText: 'Old justification',
      })
    );
  });

  it('triggers heading, undo and redo actions from toolbar buttons', async () => {
    const editor = createMockEditor();
    mockUseEditor.mockReturnValue(editor as never);

    const user = setupUserAndRender(() => renderSubject());

    const [headingButton, undoButton, redoButton] =
      screen.getAllByRole('button');

    await user.click(headingButton);
    await user.click(undoButton);
    await user.click(redoButton);

    expect(editor.toggleHeading).toHaveBeenCalledWith({ level: 2 });
    expect(editor.undo).toHaveBeenCalled();
    expect(editor.redo).toHaveBeenCalled();
  });

  it('disables undo and redo buttons when editor cannot undo or redo', () => {
    const editor = createMockEditor({ canUndo: false, canRedo: false });
    mockUseEditor.mockReturnValue(editor as never);

    renderSubject();

    const [, undoButton, redoButton] = screen.getAllByRole('button');

    expect(undoButton).toBeDisabled();
    expect(redoButton).toBeDisabled();
  });
});
