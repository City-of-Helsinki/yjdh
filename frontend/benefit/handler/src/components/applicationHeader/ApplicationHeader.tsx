import StatusLabel from 'benefit/handler/components/statusLabel/StatusLabel';
import useChangeHandlerMutation from 'benefit/handler/hooks/useChangeHandlerMutation';
import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import { Application } from 'benefit-shared/types/application';
import { Button, IconLockOpen } from 'hds-react';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import Container from 'shared/components/container/Container';
import { getFullName } from 'shared/utils/application.utils';
import { convertToUIDateFormat, formatDate } from 'shared/utils/date.utils';
import {
  getLocalStorageItem,
  removeLocalStorageItem,
  setLocalStorageItem,
} from 'shared/utils/localstorage.utils';

import { $NoticeBar } from '../applicationReview/ApplicationReview.sc';
import {
  $Background,
  $Col,
  $InnerWrapper,
  $ItemHeader,
  $ItemValue,
  $ItemWrapper,
  $Wrapper,
} from './ApplicationHeader.sc';

type ApplicationReviewProps = {
  data: Application;
  isApplicationReadOnly: boolean;
};

const toggleNewAhjoMode = (): void => {
  // eslint-disable-next-line no-alert
  const confirm = window.confirm(
    'Kokeile Ahjo-integraation käyttöliittymää? Vain testiympäristöihin, älä käytä tuotannossa!'
  );
  if (!confirm) return;
  if (getLocalStorageItem('newAhjoMode') !== '1') {
    setLocalStorageItem('newAhjoMode', '1');
  } else {
    removeLocalStorageItem('newAhjoMode');
  }
  window.location.reload();
};

const ApplicationHeader: React.FC<ApplicationReviewProps> = ({
  data,
  isApplicationReadOnly,
}) => {
  const { t } = useTranslation();
  const translationBase = 'common:applications.list.columns';

  const employeeName = getFullName(
    data.employee?.firstName,
    data.employee?.lastName
  );

  const handlerName = getFullName(
    data.handler?.firstName,
    data.handler?.lastName
  );
  const { mutate: changeHandler } = useChangeHandlerMutation();

  const takeControl = (): void => {
    changeHandler(data.id);
  };

  if (!data.applicationNumber || data.status === APPLICATION_STATUSES.DRAFT) {
    return null;
  }

  return (
    <$Wrapper>
      <$Background>
        <Container>
          <$InnerWrapper>
            <$Col>
              <$ItemWrapper>
                <$ItemHeader>{t(`${translationBase}.companyName`)}</$ItemHeader>
                <$ItemValue>{data.company?.name}</$ItemValue>
              </$ItemWrapper>
              <$ItemWrapper>
                <$ItemHeader>{t(`${translationBase}.companyId`)}</$ItemHeader>
                <$ItemValue>{data.company?.businessId}</$ItemValue>
              </$ItemWrapper>
              <$ItemWrapper>
                <$ItemHeader>
                  {t(`${translationBase}.applicationNum`)}
                </$ItemHeader>
                <$ItemValue>{data.applicationNumber}</$ItemValue>
              </$ItemWrapper>
              <$ItemWrapper>
                <$ItemHeader>
                  {t(`${translationBase}.employeeName`)}
                </$ItemHeader>
                <$ItemValue>{employeeName}</$ItemValue>
              </$ItemWrapper>
              {handlerName && (
                <$ItemWrapper>
                  <$ItemHeader>
                    {t(`${translationBase}.handlerName`)}
                  </$ItemHeader>
                  <$ItemValue>{handlerName}</$ItemValue>
                </$ItemWrapper>
              )}
              <$ItemWrapper>
                <$ItemHeader>{t(`${translationBase}.submittedAt`)}</$ItemHeader>
                <$ItemValue>
                  {data.submittedAt && formatDate(new Date(data.submittedAt))}
                </$ItemValue>
              </$ItemWrapper>
              <$ItemWrapper>
                <button
                  style={{ fontSize: '10px' }}
                  type="button"
                  onClick={toggleNewAhjoMode}
                >
                  Ahjo-kokeilu
                  <br />
                  {getLocalStorageItem('newAhjoMode') ? 'pois' : 'päälle'}
                </button>
              </$ItemWrapper>
            </$Col>
            <$Col>
              <StatusLabel status={data.status} />
            </$Col>
          </$InnerWrapper>
        </Container>
      </$Background>
      {isApplicationReadOnly && (
        <$NoticeBar>
          {t(`common:review.notifications.handlerMismatch`, {
            handler: `${data.handler?.firstName} ${data.handler?.lastName[0]}.`,
          })}{' '}
          <Button
            variant="supplementary"
            theme="coat"
            size="small"
            iconLeft={<IconLockOpen />}
            onClick={() => takeControl()}
          >
            {t('common:review.actions.handle')}
          </Button>
        </$NoticeBar>
      )}

      {data.status === APPLICATION_STATUSES.INFO_REQUIRED && (
        <$NoticeBar>
          {t(`common:review.notifications.editEndDate`, {
            date: convertToUIDateFormat(data.additionalInformationNeededBy),
          })}
          <IconLockOpen />
        </$NoticeBar>
      )}
    </$Wrapper>
  );
};

export default ApplicationHeader;
