import {
  ButtonPresetTheme,
  ButtonSize,
  ButtonVariant,
  IconCross,
  IconUser,
} from 'hds-react';
import useAssignApplicationMutation from 'kesaseteli/handler/hooks/backend/useAssignApplicationMutation';
import useUnassignApplicationMutation from 'kesaseteli/handler/hooks/backend/useUnassignApplicationMutation';
import useAssignee from 'kesaseteli/handler/hooks/useAssignee';
import { ApplicationListType } from 'kesaseteli/handler/types/application';
import type { Assignee } from 'kesaseteli-shared/types/application';
import { useTranslation } from 'next-i18next';
import React from 'react';
import Button from 'shared/components/button/Button';

import {
  $AssigneeName,
  $AssigneeValueWrapper,
  $UnassignButton,
} from './AssignmentControls.sc';

type Props = {
  id: string;
  assignee?: Assignee | string | null;
  modified_at?: string;
  applicationType: ApplicationListType;
};

const AssignmentControls: React.FC<Props> = ({
  id,
  assignee,
  modified_at,
  applicationType,
}) => {
  const { t } = useTranslation();

  const assignMutation = useAssignApplicationMutation(applicationType);
  const unassignMutation = useUnassignApplicationMutation(applicationType);
  const { isAssignee, assigneeName } = useAssignee(assignee);

  const assignToMe = (): void => {
    assignMutation.mutate({ id, modified_at });
  };

  const unassignMe = (): void => {
    unassignMutation.mutate({ id });
  };

  if (isAssignee) {
    return (
      <$AssigneeValueWrapper>
        <$AssigneeName>{assigneeName}</$AssigneeName>
        <$UnassignButton
          loadingText={t('common:handlerApplication.saving')}
          variant={ButtonVariant.Supplementary}
          size={ButtonSize.Small}
          iconStart={<IconCross aria-hidden />}
          onClick={unassignMe}
          isLoading={unassignMutation.isPending}
          disabled={unassignMutation.isPending || assignMutation.isPending}
        >
          {t('common:application.unassignApplication')}
        </$UnassignButton>
      </$AssigneeValueWrapper>
    );
  }

  return (
    <$AssigneeValueWrapper>
      {assigneeName && <$AssigneeName>{assigneeName}</$AssigneeName>}
      <Button
        loadingText={t('common:handlerApplication.saving')}
        theme={ButtonPresetTheme.Coat}
        size={ButtonSize.Small}
        iconStart={<IconUser aria-hidden />}
        onClick={assignToMe}
        isLoading={assignMutation.isPending}
        disabled={assignMutation.isPending || unassignMutation.isPending}
      >
        {t('common:application.assignApplication')}
      </Button>
    </$AssigneeValueWrapper>
  );
};

export default AssignmentControls;
