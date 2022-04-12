import { IconSignin } from 'hds-react';
import useCreateYouthApplicationQuery from 'kesaseteli/youth/hooks/backend/useCreateYouthApplicationQuery';
import useHandleYouthApplicationSubmit from 'kesaseteli/youth/hooks/useHandleYouthApplicationSubmit';
import { useTranslation } from 'next-i18next';
import React from 'react';
import SaveFormButton from 'shared/components/forms/buttons/SaveFormButton';

const ForceSubmitInfo: React.FC = () => {
  const { t } = useTranslation();

  const forceSubmitQuery = useCreateYouthApplicationQuery({
    request_additional_information: true,
  });

  const { handleSaveSuccess, handleErrorResponse } =
    useHandleYouthApplicationSubmit();

  return (
    <p>
      {t(`common:youthApplication.form.sendItAnyway`)}
      <SaveFormButton
        asLink
        saveQuery={forceSubmitQuery}
        onSuccess={handleSaveSuccess}
        onError={handleErrorResponse}
        iconLeft={<IconSignin />}
      >
        {t(`common:youthApplication.form.forceSubmitLink`)}
      </SaveFormButton>
    </p>
  );
};

export default ForceSubmitInfo;
