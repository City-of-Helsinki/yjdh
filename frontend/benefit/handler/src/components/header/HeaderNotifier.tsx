import useApplicationMessagesQuery from 'benefit/handler/hooks/useApplicationsWithMessagesQuery';
import { IconAngleRight, IconBell } from 'hds-react';
import { useTranslation } from 'next-i18next';
import * as React from 'react';

import {
  $ApplicationWithMessages,
  $Box,
  $HeaderNotifier,
  $ToggleButton,
} from './Header.sc';

const Header: React.FC = () => {
  const [messageCenterActive, setMessageCenterActive] = React.useState(false);

  const { t } = useTranslation();
  const applicationsWithMessages = useApplicationMessagesQuery()?.data || [];
  const handleMessageCenterClick = (e: React.MouseEvent): void => {
    e.preventDefault();
    setMessageCenterActive(!messageCenterActive);
  };

  return (
    <$HeaderNotifier
      $enabled={applicationsWithMessages?.length > 0}
      aria-live="polite"
    >
      {applicationsWithMessages?.length > 0 && (
        <$ToggleButton onClick={(e) => handleMessageCenterClick(e)}>
          <IconBell />
          <span>{applicationsWithMessages?.length}</span>
        </$ToggleButton>
      )}
      <$Box $open={messageCenterActive} aria-hidden={!messageCenterActive}>
        <h2>{t('common:header.messages')}</h2>
        <ul>
          {applicationsWithMessages.map((application) => (
            <li>
              <$ApplicationWithMessages
                onClick={() => setMessageCenterActive(false)}
                href={`/application?id=${String(application.id)}&openDrawer=1`}
              >
                <div>
                  <strong>Hakemus {application.application_number}</strong>
                </div>
                <div>{application.company.name}</div>
                <div>
                  {application.employee.first_name}{' '}
                  {application.employee.last_name}
                </div>
                <div>
                  <IconAngleRight />
                </div>
              </$ApplicationWithMessages>
            </li>
          ))}
        </ul>
      </$Box>
    </$HeaderNotifier>
  );
};

export default Header;