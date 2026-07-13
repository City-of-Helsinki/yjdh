import { Button, ButtonSize, ButtonVariant, Checkbox, RadioButton } from 'hds-react';
import { useTranslation } from 'next-i18next';
import React, { useState } from 'react';
import useLocale from 'shared/hooks/useLocale';

import {
  CreateNotePayload,
  HandlerNote,
  NoteTargetType,
  NoteType,
  UpdateNotePayload,
} from '../../types/note';
import {
  $CharCounter,
  $FormActions,
  $FormContainer,
  $OptionsGroup,
  $Separator,
  $TextArea,
  $Toolbar,
} from './NoteForm.sc';

const NOTE_MAX_CHARS = 4096;
const CHAR_COUNTER_WARN_THRESHOLD = 100;

type Props = {
  initialNote?: HandlerNote;
  targetType: NoteTargetType;
  targetId: string;
  onSubmit: (
    payload: CreateNotePayload | UpdateNotePayload,
    onSuccess: () => void
  ) => void;
  onCancel?: () => void;
  isLoading: boolean;
};

const NoteForm: React.FC<Props> = ({
  initialNote,
  targetType,
  targetId,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();

  const [content, setContent] = useState(initialNote?.content || '');
  const [noteType, setNoteType] = useState<NoteType>(
    initialNote?.note_type || NoteType.INTERNAL
  );
  const [isImportant, setIsImportant] = useState(
    initialNote?.is_important || false
  );

  const isEditing = Boolean(initialNote);

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (!content.trim()) return;

    const payload = isEditing
      ? ({
          content,
          note_type: noteType,
          is_important: isImportant,
        } as UpdateNotePayload)
      : ({
          target_type: targetType,
          target_id: targetId,
          content,
          note_type: noteType,
          is_important: isImportant,
        } as CreateNotePayload);

    onSubmit(payload, () => {
      if (!isEditing) {
        setContent('');
        setNoteType(NoteType.INTERNAL);
        setIsImportant(false);
      }
      if (isEditing && onCancel) {
        onCancel();
      }
    });
  };

  const charsLeft = NOTE_MAX_CHARS - content.length;
  const isNearLimit = charsLeft <= CHAR_COUNTER_WARN_THRESHOLD;

  return (
    <$FormContainer onSubmit={handleSubmit} noValidate>
      {/* @ts-expect-error: HDS React TextArea has stricter type definitions for its props, causing TS2740 */}
      <$TextArea
        id={isEditing ? `edit-note-${initialNote?.id}` : 'add-note-content'}
        label={
          isEditing
            ? t('common:handlerNotes.editNote')
            : t('common:handlerNotes.notePlaceholder')
        }
        value={content}
        onChange={(e) => setContent(e.target.value)}
        maxLength={NOTE_MAX_CHARS}
        required
        rows={4}
      />
      <$CharCounter $isNearLimit={isNearLimit}>
        {`${charsLeft.toLocaleString(locale)} / ${NOTE_MAX_CHARS.toLocaleString(
          locale
        )}`}
      </$CharCounter>

      <$Toolbar>
        <$OptionsGroup>
          <RadioButton
            id={isEditing ? `note-type-internal-${initialNote?.id}` : 'note-type-internal'}
            label={t('common:handlerNotes.noteType.internal')}
            value={NoteType.INTERNAL}
            checked={noteType === NoteType.INTERNAL}
            onChange={() => setNoteType(NoteType.INTERNAL)}
          />
          <RadioButton
            id={isEditing ? `note-type-external-${initialNote?.id}` : 'note-type-external'}
            label={t('common:handlerNotes.noteType.external_message')}
            value={NoteType.EXTERNAL_MESSAGE}
            checked={noteType === NoteType.EXTERNAL_MESSAGE}
            onChange={() => setNoteType(NoteType.EXTERNAL_MESSAGE)}
          />
          <$Separator aria-hidden="true" />
          <Checkbox
            id={isEditing ? `note-is-important-${initialNote?.id}` : 'note-is-important'}
            label={t('common:handlerNotes.isImportantLabel')}
            checked={isImportant}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setIsImportant(e.target.checked)
            }
          />
        </$OptionsGroup>

        <$FormActions>
          {isEditing && onCancel && (
            <Button
              type="button"
              variant={ButtonVariant.Secondary}
              size={ButtonSize.Small}
              onClick={onCancel}
            >
              {t('common:common.cancel')}
            </Button>
          )}
          <Button
            type="submit"
            size={ButtonSize.Small}
            disabled={!content.trim() || isLoading}
            isLoading={isLoading}
            loadingText={t('common:common.saving')}
          >
            {isEditing
              ? t('common:handlerNotes.saveNote')
              : t('common:handlerNotes.addNote')}
          </Button>
        </$FormActions>
      </$Toolbar>
    </$FormContainer>
  );
};

export default NoteForm;
