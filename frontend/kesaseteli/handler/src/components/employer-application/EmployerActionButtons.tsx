import {
  ButtonPresetTheme,
  ButtonVariant,
  IconCheck,
  IconCross,
} from 'hds-react';
import {
  $ActionsContainer,
  $ActionsHeading,
  $ButtonsRow,
} from 'kesaseteli/handler/components/form/ActionButtons.sc';
import useCompleteEmployerApplicationQuery from 'kesaseteli/handler/hooks/backend/useCompleteEmployerApplicationQuery';
import useAssignee from 'kesaseteli/handler/hooks/useAssignee';
import EmployerCompleteOperation from 'kesaseteli/handler/types/employer-complete-operation';
import HandlerEmployerApplication from 'kesaseteli/handler/types/HandlerEmployerApplication';
import { useTranslation } from 'next-i18next';
import React, { useCallback } from 'react';
import Button from 'shared/components/button/Button';
import { GridCellProps } from 'shared/components/forms/section/FormSection.sc';
import useConfirm from 'shared/hooks/useConfirm';

type Props = GridCellProps & {
  application: HandlerEmployerApplication;
};

const ICONS = {
  accept: <IconCheck aria-hidden />,
  reject: <IconCross aria-hidden />,
};

const EmployerActionButtons: React.FC<Props> = ({
  application,
  ...gridCellprops
}) => {
  const { t } = useTranslation();
  const { id, assignee } = application;
  const { confirm } = useConfirm();
  const { isPending, mutate } = useCompleteEmployerApplicationQuery(id);
  const { isAssignee } = useAssignee(assignee);

  const complete = useCallback(
    async (type: EmployerCompleteOperation['type']): Promise<void> => {
      const isConfirmed = await confirm({
        header: t(`common:dialog.${type}.title`),
        content: t(`common:dialog.${type}.content`),
        submitButtonLabel: t(`common:dialog.${type}.submit`),
        submitButtonIcon: ICONS[type],
        submitButtonVariant:
          type === 'reject' ? ButtonVariant.Danger : ButtonVariant.Primary,
      });
      if (isConfirmed) {
        mutate({ type });
      }
    },
    [confirm, t, mutate]
  );

  const handleAccept = useCallback(() => complete('accept'), [complete]);
  const handleReject = useCallback(() => complete('reject'), [complete]);

  return (
    <$ActionsContainer {...gridCellprops}>
      <$ActionsHeading id="action-buttons-heading">
        {t('common:handlerApplication.actionsTitle')}
      </$ActionsHeading>
      <$ButtonsRow aria-labelledby="action-buttons-heading">
        <Button
          loadingText={t('common:handlerApplication.saving')}
          theme={ButtonPresetTheme.Coat}
          iconStart={ICONS.accept}
          onClick={handleAccept}
          isLoading={isPending}
          disabled={isPending || !isAssignee}
        >
          {t('common:handlerApplication.accept')}
        </Button>
        <Button
          variant={ButtonVariant.Danger}
          iconStart={ICONS.reject}
          onClick={handleReject}
          loadingText={t('common:handlerApplication.saving')}
          isLoading={isPending}
          disabled={isPending || !isAssignee}
        >
          {t('common:handlerApplication.reject')}
        </Button>
      </$ButtonsRow>
    </$ActionsContainer>
  );
};

export default EmployerActionButtons;
