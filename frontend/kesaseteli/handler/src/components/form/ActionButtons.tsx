import { Button, IconCheck, IconCross } from 'hds-react';
import useCompleteYouthApplicationQuery from 'kesaseteli/handler/hooks/backend/useCompleteYouthApplicationQuery';
import CompleteOperation from 'kesaseteli/handler/types/complete-operation';
import isVtjDisabled from 'kesaseteli-shared/flags/is-vtj-disabled';
import ActivatedYouthApplication from 'kesaseteli-shared/types/activated-youth-application';
import { useTranslation } from 'next-i18next';
import React from 'react';
import {
  $GridCell,
  GridCellProps,
} from 'shared/components/forms/section/FormSection.sc';
import useConfirm from 'shared/hooks/useConfirm';
import { useTheme } from 'styled-components';

type Props = GridCellProps & {
  application: ActivatedYouthApplication;
};

const ActionButtons: React.FC<Props> = ({ application, ...gridCellprops }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { id, encrypted_handler_vtj_json } = application;
  const { confirm } = useConfirm();
  const { isLoading, mutate } = useCompleteYouthApplicationQuery(id);
  const isVtjEnabled = !isVtjDisabled();
  const vtjDataNotFound =
    isVtjEnabled &&
    (!encrypted_handler_vtj_json ||
      !('Henkilo' in encrypted_handler_vtj_json) ||
      encrypted_handler_vtj_json?.Henkilo?.Henkilotunnus?.[
        '@voimassaolokoodi'
      ] === '0');
  const icon = React.useMemo(
    () => ({
      accept: <IconCheck aria-hidden />,
      reject: <IconCross aria-hidden />,
    }),
    []
  );

  const complete = async (type: CompleteOperation['type']): Promise<void> => {
    const isConfirmed = await confirm({
      header: t(`common:dialog.${type}.title`),
      content: t(`common:dialog.${type}.content`),
      submitButtonLabel: t(`common:dialog.${type}.submit`),
      submitButtonIcon: icon[type],
      submitButtonVariant: type === 'reject' ? 'danger' : 'primary',
    });
    if (isConfirmed) {
      mutate({ type, encrypted_handler_vtj_json });
    }
  };

  return (
    <$GridCell {...gridCellprops}>
      <Button
        theme="coat"
        data-testid="accept-button"
        iconLeft={icon.accept}
        onClick={() => complete('accept')}
        isLoading={isLoading}
        disabled={vtjDataNotFound || isLoading}
        css={`
          margin-right: ${theme.spacing.l};
        `}
      >
        {t(`common:handlerApplication.accept`)}
      </Button>
      <Button
        variant="danger"
        data-testid="reject-button"
        iconLeft={icon.reject}
        onClick={() => complete('reject')}
        loadingText={t(`common:handlerApplication.saving`)}
        isLoading={isLoading}
        disabled={vtjDataNotFound || isLoading}
      >
        {t(`common:handlerApplication.reject`)}
      </Button>
    </$GridCell>
  );
};

export default ActionButtons;
