import StatusLabel from 'benefit/handler/components/statusLabel/StatusLabel';
import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import { Application } from 'benefit-shared/types/application';
import { IconLockOpen } from 'hds-react';
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

import { $InfoNeededBar } from '../applicationReview/ApplicationReview.sc';
import {
  $Background,
  $Col,
  $InnerWrapper,
  $ItemHeader,
  $ItemValue,
  $ItemWrapper,
  $Wrapper,
} from './ApplicationHeader.sc';

type ApplicationReviewProps = { data: Application };

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

const ApplicationHeader: React.FC<ApplicationReviewProps> = ({ data }) => {
  const { t } = useTranslation();
  const translationBase = 'common:applications.list.columns';
  const employeeName = getFullName(
    data.employee?.firstName,
    data.employee?.lastName
  );

  const handlerName = getFullName(
    data.calculation?.handlerDetails?.firstName,
    data.calculation?.handlerDetails?.lastName
  );

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

      {data.status === APPLICATION_STATUSES.INFO_REQUIRED && (
        <$InfoNeededBar>
          {t(`common:review.fields.editEndDate`, {
            date: convertToUIDateFormat(data.additionalInformationNeededBy),
          })}
          <IconLockOpen />
        </$InfoNeededBar>
      )}
    </$Wrapper>
  );
};

export default ApplicationHeader;
