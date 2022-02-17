import Field from 'kesaseteli/handler/components/form/Field';
import CreatedYouthApplication from 'kesaseteli-shared/types/created-youth-application';
import { useTranslation } from 'next-i18next';
import React from 'react';
import FormSection from 'shared/components/forms/section/FormSection';
import FormSectionHeading from 'shared/components/forms/section/FormSectionHeading';
import { convertToUIDateAndTimeFormat } from 'shared/utils/date.utils';

type Props = {
  application: CreatedYouthApplication;
};

const HandlerForm: React.FC<Props> = ({ application }) => {
  const { t } = useTranslation();
  const {
    receipt_confirmed_at,
    first_name,
    last_name,
    social_security_number,
    postcode,
    school,
    is_unlisted_school,
    phone_number,
    email,
  } = application;
  return (
    <FormSection columns={2}>
      <FormSectionHeading
        $colSpan={2}
        size="s"
        header={t('common:handlerApplication.title')}
        as="h3"
      />
      <Field
        id="receipt_confirmed_at"
        value={convertToUIDateAndTimeFormat(receipt_confirmed_at)}
      />
      <Field type="name" value={`${first_name} ${last_name}`} />
      <Field type="social_security_number" value={social_security_number} />
      <Field type="postcode" value={postcode} />
      <Field
        type="school"
        value={`${school ?? ''} ${
          is_unlisted_school
            ? t('common:handlerApplication.is_unlisted_school')
            : ''
        }`}
      />
      <Field type="phone_number" value={phone_number} />
      <Field type="email" value={email} />
    </FormSection>
  );
};

export default HandlerForm;
