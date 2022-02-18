import Field from 'kesaseteli/handler/components/form/Field';
import CreatedYouthApplication from 'kesaseteli-shared/types/created-youth-application';
import { useTranslation } from 'next-i18next';
import React from 'react';
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
    <>
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
    </>
  );
};

export default HandlerForm;
