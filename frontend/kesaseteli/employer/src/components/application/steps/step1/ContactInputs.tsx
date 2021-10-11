import TextInput from 'kesaseteli/employer/components/application/form/TextInput';
import React from 'react';
import { EMAIL_REGEX } from 'shared/constants';

type Props = {
  type: 'contact_person' | 'invoicer';
};
const ContactInputs: React.FC<Props> = ({ type }) => (
  <>
    <TextInput
      id={`${type}_name`}
      validation={{ required: true, maxLength: 256 }}
    />
    <TextInput
      id={`${type}_email`}
      validation={{
        required: true,
        maxLength: 254,
        pattern: EMAIL_REGEX,
      }}
    />
    <TextInput
      id={`${type}_phone_number`}
      validation={{ required: true, maxLength: 64 }}
    />
  </>
);

export default ContactInputs;
