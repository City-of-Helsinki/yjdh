/* eslint-disable sonarjs/cognitive-complexity */
import {
  ButtonSize,
  ButtonVariant,
  Checkbox,
  Dialog,
  Notification,
  NotificationSize,
  RadioButton,
  Select,
} from 'hds-react';
import { useHandlerPermissions } from 'kesaseteli/handler/contexts/HandlerPermissionsContext';
import isHandlerExternalMessagesEnabled from 'kesaseteli/handler/flags/is-handler-external-messages-enabled';
import { useTranslation } from 'next-i18next';
import React, { useState } from 'react';
import Button from 'shared/components/button/Button';
import useLocale from 'shared/hooks/useLocale';

import {
  CreateNotePayload,
  EmployerExternalMessages,
  HandlerNote,
  NoteTargetType,
  NoteType,
  UpdateNotePayload,
  YouthExternalMessages,
} from '../../types/note';
import {
  $CharCounter,
  $CheckboxContainer,
  $FormActions,
  $FormContainer,
  $Instructions,
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
  applicationLanguage?: string;
};

const NoteForm: React.FC<Props> = ({
  initialNote,
  targetType,
  targetId,
  onSubmit,
  onCancel,
  isLoading,
  applicationLanguage,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { canAddExternalMessage, hasNotePermission } = useHandlerPermissions();

  const [content, setContent] = useState(initialNote?.content || '');
  const [noteType, setNoteType] = useState<NoteType>(
    initialNote?.note_type || NoteType.INTERNAL
  );
  const [isImportant, setIsImportant] = useState(
    initialNote?.is_important || false
  );
  const [markAsAdditionalInfoRequested, setMarkAsAdditionalInfoRequested] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | undefined>('');

  const isEditing = Boolean(initialNote);

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isSuspiciousStringDialogOpen, setIsSuspiciousStringDialogOpen] = useState(false);

  // Gate by assignee permission based on target type and note type, even when editing.
  const canAddNotes = hasNotePermission(targetType, noteType);

  if (!canAddNotes) {
    return isEditing ? null : (
      <Notification
        type="info"
        size={NotificationSize.Small}
        style={{ marginBottom: 'var(--spacing-m)' }}
      >
        {t('common:handlerNotes.cannotAddNoteNotAssignee')}
      </Notification>
    );
  }

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (!content.trim()) return;

    if (noteType === NoteType.EXTERNAL_MESSAGE && hasSuspiciousString(content)) {
      setIsSuspiciousStringDialogOpen(true);
      return;
    }

    // Show confirmation dialog for external messages
    if (noteType === NoteType.EXTERNAL_MESSAGE) {
      setIsConfirmDialogOpen(true);
      return;
    }

    // For internal notes, submit directly
    submitForm();
  };

  const getSubmitButtonText = (): string => {
    if (noteType === NoteType.EXTERNAL_MESSAGE) {
      return t('common:common.send');
    }
    if (isEditing) {
      return t('common:handlerNotes.saveNote');
    }
    return t('common:handlerNotes.addNote');
  };

  const getMessageTemplates = () => {
    let templates = null;
    if (targetType === NoteTargetType.EMPLOYER_APPLICATION)
      templates = Object.keys(EmployerExternalMessages).map((key) => ({
        label: t(`common:employerExternalMessages.${EmployerExternalMessages[key]}.label`),
        value: EmployerExternalMessages[key],
      }));
    else {
      templates = Object.keys(YouthExternalMessages).map((key) => ({
        label: t(`common:youthExternalMessages.${YouthExternalMessages[key]}.label`),
        value: YouthExternalMessages[key],
      }));
    }
    return templates;
  }

  const submitForm = (): void => {
    if (noteType === NoteType.EXTERNAL_MESSAGE) setSelectedTemplate('');

    const payload = isEditing
      ? ({
          content,
          note_type: noteType,
          is_important: isImportant,
          mark_as_additional_info_requested: markAsAdditionalInfoRequested,
        } as UpdateNotePayload)
      : ({
          target_type: targetType,
          target_id: targetId,
          content,
          note_type: noteType,
          is_important: isImportant,
          mark_as_additional_info_requested: markAsAdditionalInfoRequested,
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

  const handleConfirmSend = (): void => {
    setIsConfirmDialogOpen(false);
    submitForm();
  };

  const hasSuspiciousString = (text: string): boolean => {
    return /\d{6}.?\d{3}[\dA-Z]/.exec(text) !== null;
  }

  const charsLeft = NOTE_MAX_CHARS - content.length;
  const isNearLimit = charsLeft <= CHAR_COUNTER_WARN_THRESHOLD;
  const showExternalOptions = targetType !== NoteTargetType.ATTACHMENT;

  return (<>
      <$FormContainer
      onSubmit={handleSubmit}
      noValidate
      aria-label={
        isEditing
          ? t('common:handlerNotes.saveNote')
          : t('common:handlerNotes.addNote')
      }
    >       {noteType === NoteType.EXTERNAL_MESSAGE ? (
          <$Instructions>
            <h3>{t('common:externalMessages.instructions.label')}</h3>
            <p>{t('common:externalMessages.instructions.content')}</p>
          </$Instructions>
        ) : (
          <$Instructions>
            <h3>{t('common:handlerNotes.instructions.label')}</h3>
            <p>{t('common:handlerNotes.instructions.content')}</p>
          </$Instructions>
        )}

        {noteType === NoteType.EXTERNAL_MESSAGE && (
          <Select
            required
            texts={{
              label: t('common:externalMessages.selectTemplate'),
              language: 'fi',
              assistive: `Hakemuksen kieli: ${applicationLanguage || 'fi'}`
            }}
            options={getMessageTemplates()}
            value={selectedTemplate}
            onChange={(
              selectedOptions: Array<{ label: string; value: string }>
            ) => {
              const selected = selectedOptions[0];
              if (selected) {
                setSelectedTemplate(selected.value);
                console.log(selected.value);
                setContent(targetType === NoteTargetType.EMPLOYER_APPLICATION ?
                  t(
                    `common:employerExternalMessages.${selected.value}.${applicationLanguage || 'fi'}`
                  )
                  :
                  t(
                    `common:youthExternalMessages.${selected.value}.${applicationLanguage || 'fi'}`
                  )
                );
                if (selected.value === 'thankYouForInformation') {
                  setMarkAsAdditionalInfoRequested(false);
                  } else {
                  setMarkAsAdditionalInfoRequested(true);
                }
              }
            }}
          />
        )}
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
        {showExternalOptions && !canAddExternalMessage && (
          <Notification
            type="info"
            size={NotificationSize.Small}
            style={{ marginTop: 'var(--spacing-s)', width: '100%' }}
          >
            {t('common:handlerNotes.cannotAddExternalMessageNotAssignee')}
          </Notification>
        )}
        <$OptionsGroup>
          <RadioButton
            id={
              isEditing
                ? `note-type-internal-${initialNote?.id}`
                : 'note-type-internal'
            }
            label={t('common:handlerNotes.noteType.internal')}
            value={NoteType.INTERNAL}
            checked={noteType === NoteType.INTERNAL}
            onChange={() => setNoteType(NoteType.INTERNAL)}
          />
          {showExternalOptions && (
            <RadioButton
              id={
                isEditing
                  ? `note-type-external-${initialNote?.id}`
                  : 'note-type-external'
              }
              label={t('common:handlerNotes.noteType.external_message')}
              value={NoteType.EXTERNAL_MESSAGE}
              checked={noteType === NoteType.EXTERNAL_MESSAGE}
              onChange={() => setNoteType(NoteType.EXTERNAL_MESSAGE)}
              disabled={!canAddExternalMessage}
            />
          )}
          <$Separator aria-hidden="true" />
          <Checkbox
            id={
              isEditing
                ? `note-is-important-${initialNote?.id}`
                : 'note-is-important'
            }
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
            {getSubmitButtonText()}
          </Button>
        </$FormActions>
      </$Toolbar>
      <$Toolbar>
        <$OptionsGroup>
          {targetType === NoteTargetType.EMPLOYER_APPLICATION && noteType === NoteType.EXTERNAL_MESSAGE && (
            <$CheckboxContainer>
              <Checkbox
                id='mark-as-additional-info-requested'
                label={t('common:handlerNotes.additionalInfoRequested')}
                checked={markAsAdditionalInfoRequested}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setMarkAsAdditionalInfoRequested(e.target.checked)
                }
              />
            </$CheckboxContainer>
          )}
        </$OptionsGroup>
      </$Toolbar>
    </$FormContainer>
    <Dialog
        id="external-message-confirm-dialog"
        aria-labelledby="external-message-confirm-title"
        isOpen={isConfirmDialogOpen}
        close={() => setIsConfirmDialogOpen(false)}
        closeButtonLabelText={t('common:common.close')}
      >
        <Dialog.Header
          id="external-message-confirm-title"
          title={t('common:externalMessages.confirmation.title')}
        />
        <Dialog.Content>
          {t('common:externalMessages.confirmation.text')}
        </Dialog.Content>
        <Dialog.ActionButtons>
          <Button
            onClick={() => setIsConfirmDialogOpen(false)}
            variant={ButtonVariant.Secondary}
          >
            {t('common:common.cancel')}
          </Button>
          <Button onClick={handleConfirmSend} disabled={isLoading}>
            {t('common:common.send')}
          </Button>
        </Dialog.ActionButtons>
      </Dialog>
      <Dialog
        id="external-message-suspicious-string-dialog"
        aria-labelledby="external-message-suspicious-string-title"
        isOpen={isSuspiciousStringDialogOpen}
        close={() => setIsSuspiciousStringDialogOpen(false)}
        closeButtonLabelText={t('common:common.close')}
      >
        <Dialog.Header
          id="external-message-suspicious-string-title"
          title={t('common:externalMessages.suspiciousString.title')}
        />
        <Dialog.Content>
          {t('common:externalMessages.suspiciousString.text')}
        </Dialog.Content>
        <Dialog.ActionButtons>
          <Button
            onClick={() => setIsSuspiciousStringDialogOpen(false)}
            variant={ButtonVariant.Primary}
          >
            {t('common:common.cancel')}
          </Button>
        </Dialog.ActionButtons>
      </Dialog>
    </>
  );
};

export default NoteForm;
/* eslint-enable sonarjs/cognitive-complexity */
