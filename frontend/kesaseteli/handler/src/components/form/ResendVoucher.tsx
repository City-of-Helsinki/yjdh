import { useMutation } from '@tanstack/react-query';
import { IconEnvelope } from 'hds-react';
import ActivatedYouthApplication from 'kesaseteli-shared/types/activated-youth-application';
import { useTranslation } from 'next-i18next';
import React from 'react';
import Button from 'shared/components/button/Button';
import showErrorToast from 'shared/components/toast/show-error-toast';
import useBackendAPI from 'shared/hooks/useBackendAPI';
import useConfirm from 'shared/hooks/useConfirm';
import useErrorHandler from 'shared/hooks/useErrorHandler';

type Props = {
  id: ActivatedYouthApplication['id'];
};

const ResendVoucher: React.FC<Props> = ({ id }) => {
  const { axios, handleResponse } = useBackendAPI();
  const { t } = useTranslation();
  const resendVoucherKey =
    'common:dialog.resendVoucher';
  const { confirm } = useConfirm();
  const handleError = useErrorHandler({
    onServerError: () =>
      showErrorToast(
        t('common:error.generic.label'),
        t('common:error.generic.text')
      ),
  });
  const { isPending, mutate } = useMutation({
    mutationFn: () =>
      handleResponse(
        axios.post(`/v1/youthapplications/${id}/resend_voucher/`)
      ),
    onError: handleError,
  });
  const resendVoucher = async (): Promise<void> => {
    const isConfirmed = await confirm({
      header: t(`${resendVoucherKey}.title`),
      content: t(`${resendVoucherKey}.content`),
      submitButtonLabel: t(`${resendVoucherKey}.submit`),
      submitButtonIcon: <IconEnvelope aria-hidden />,
    });

    if (isConfirmed) {
      mutate();
    }
  };

  return (
    <Button
      type="button"
      onClick={resendVoucher}
      isLoading={isPending}
      loadingText={t(`${resendVoucherKey}.submit`)}
      iconStart={<IconEnvelope aria-hidden />}
    >
      {t(`${resendVoucherKey}.submit`)}
    </Button>
  );
};

export default ResendVoucher;
