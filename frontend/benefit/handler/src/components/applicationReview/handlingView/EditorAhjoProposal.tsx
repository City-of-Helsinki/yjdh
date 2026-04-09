import Document from '@tiptap/extension-document';
import Heading from '@tiptap/extension-heading';
import History from '@tiptap/extension-history';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import { EditorContent, useEditor } from '@tiptap/react';
import AppContext from 'benefit/handler/context/AppContext';
import {
  Button,
  ButtonPresetTheme,
  ButtonSize,
  ButtonVariant,
  IconArrowRedo,
  IconArrowUndo,
  IconTextTool,
} from 'hds-react';
import React, { useEffect } from 'react';

import { $Content, $EditorWrapper, $Toolbar } from './EditorAhjoProposal.sc';

type EditorProps = {
  resetWithContent?: string;
  name: 'decisionText' | 'justificationText';
};

const EditorAhjoProposal: React.FC<EditorProps> = ({
  resetWithContent = '',
  name,
}: EditorProps) => {
  const editor = useEditor({
    extensions: [
      Document,
      History,
      Paragraph,
      Text,
      Heading.configure({
        levels: [2],
      }),
    ],
    content: resetWithContent,
  });

  const { handledApplication, setHandledApplication } =
    React.useContext(AppContext);

  useEffect(() => {
    if (editor && resetWithContent) {
      editor.commands.setContent(resetWithContent);
    }
  }, [editor, resetWithContent]);

  if (!editor) {
    return null;
  }

  // TODO: perf, this is done too many times
  editor.on('update', () => {
    setHandledApplication({
      ...handledApplication,
      [name]: editor.getHTML(),
    });
  });

  return (
    <$EditorWrapper>
      <$Toolbar>
        <Button
          size={ButtonSize.Small}
          theme={ButtonPresetTheme.Black}
          iconEnd={null}
          variant={ButtonVariant.Supplementary}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={
            editor.isActive('heading', { level: 2 }) ? 'is-active' : ''
          }
        >
          <IconTextTool />
        </Button>

        <Button
          iconEnd={null}
          size={ButtonSize.Small}
          theme={ButtonPresetTheme.Black}
          variant={ButtonVariant.Supplementary}
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <IconArrowUndo />
        </Button>
        <Button
          iconEnd={null}
          size={ButtonSize.Small}
          theme={ButtonPresetTheme.Black}
          variant={ButtonVariant.Supplementary}
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <IconArrowRedo />
        </Button>
      </$Toolbar>

      <$Content>
        <div data-testid={name}>
          <EditorContent editor={editor} />
        </div>
      </$Content>
    </$EditorWrapper>
  );
};

export default EditorAhjoProposal;
