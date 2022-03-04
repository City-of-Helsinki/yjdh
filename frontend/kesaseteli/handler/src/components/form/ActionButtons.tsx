import { Button, IconCheck, IconCross } from 'hds-react';
import useCompleteYouthApplicationQuery from 'kesaseteli/handler/hooks/backend/useCompleteYouthApplicationQuery';
import CreatedYouthApplication from 'kesaseteli-shared/types/created-youth-application';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import { useTheme } from 'styled-components';

type Props = {
  id: CreatedYouthApplication['id'];
};

const HandlerForm: React.FC<Props> = ({ id }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { isLoading, mutate } = useCompleteYouthApplicationQuery(id);
  const accept = React.useCallback(() => mutate('accept'), [mutate]);
  const reject = React.useCallback(() => mutate('reject'), [mutate]);

  return (
    <$GridCell>
      <Button
        theme="coat"
        data-testid="accept-button"
        iconLeft={<IconCheck />}
        onClick={accept}
        isLoading={isLoading}
        disabled={isLoading}
        css={`
          margin-right: ${theme.spacing.l};
        `}
      >
        {t(`common:handlerApplication.accept`)}
      </Button>
      <Button
        variant="secondary"
        theme="black"
        data-testid="reject-button"
        iconLeft={<IconCross />}
        onClick={reject}
        loadingText={t(`common:handlerApplication.saving`)}
        isLoading={isLoading}
        disabled={isLoading}
      >
        {t(`common:handlerApplication.reject`)}
      </Button>
    </$GridCell>
  );
};

export default HandlerForm;
