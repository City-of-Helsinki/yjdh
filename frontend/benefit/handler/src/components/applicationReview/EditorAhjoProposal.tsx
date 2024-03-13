import Document from '@tiptap/extension-document';
import Heading from '@tiptap/extension-heading';
import History from '@tiptap/extension-history';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import { EditorContent, useEditor } from '@tiptap/react';
import { Button, IconArrowRedo, IconArrowUndo, IconTextTool } from 'hds-react';
import React, { useEffect } from 'react';

type EditorProps = {
  content?: string;
};

const EditorAhjoProposal: React.FC<EditorProps> = ({ content = '' }) => {
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
    content,
  });

  useEffect(() => {
    if (editor && content) editor.commands.setContent(content);
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: '7px',
        border: '1px solid grey',
      }}
    >
      <header
        style={{
          paddingLeft: '0.5em',
          borderBottom: '1px solid grey',
        }}
      >
        <Button
          size="small"
          theme="black"
          iconRight={null}
          variant="supplementary"
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
          iconRight={null}
          size="small"
          theme="black"
          variant="supplementary"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <IconArrowUndo />
        </Button>
        <Button
          iconRight={null}
          size="small"
          theme="black"
          variant="supplementary"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <IconArrowRedo />
        </Button>
      </header>

      <div style={{ padding: '1em' }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default EditorAhjoProposal;
