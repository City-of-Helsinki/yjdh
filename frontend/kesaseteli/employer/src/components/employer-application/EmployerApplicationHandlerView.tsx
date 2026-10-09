import { Notification, Tab, TabList, TabPanel } from 'hds-react';
import useMediaQuery from 'kesaseteli/employer/hooks/useMediaQuery';
import { useTranslation } from 'next-i18next';
import React, { useState } from 'react';
import { convertToUIDateAndTimeFormat } from 'shared/utils/date.utils';
import { useTheme } from 'styled-components';

import useExternalMessagesQuery from '../../hooks/backend/useExternalMessagesQuery';
import useMarkMessagesReadMutation from '../../hooks/backend/useMarkMessagesReadMutation';
import useUnreadMessagesCountQuery from '../../hooks/backend/useUnreadMessagesCountQuery';
import type HandlerEmployerApplication from '../../types/HandlerEmployerApplication';
import { HandlerSummerVoucher } from '../../types/HandlerEmployerApplication';
import {
  $CompanySection,
  $ContactSection,
  $InvoicerSection,
  $Message,
  $PanelGrid,
  $PaymentSection,
  $StatusSection,
  $StickyTabs,
  $VoucherSection,
  $YouthSection,
} from './EmployerApplicationHandlerView.sc';
import EmployerApplicationStatusSection from './EmployerApplicationStatusFieldsSection';
import EmployerCompanyFieldsSection from './EmployerCompanyFieldsSection';
import EmployerContactPersonFieldsSection from './EmployerContactPersonFieldsSection';
import EmployerInvoicerFieldsSection from './EmployerInvoicerFieldsSection';
import EmployerPaymentFieldsSection from './EmployerPaymentFieldsSection';
import EmployerVoucherFieldsSection from './EmployerVoucherFieldsSection';
import YouthInfoFieldsSection from './YouthInfoFieldsSection';

type Props = {
  application: HandlerEmployerApplication;
};

const EmployerApplicationPanel: React.FC<
  Props & { voucher: HandlerSummerVoucher }
> = ({ application, voucher }) => {
  const { data: messages } = useExternalMessagesQuery(application.id);
  const { t } = useTranslation();

  return (
    <$PanelGrid>
      <$StatusSection>
        <EmployerApplicationStatusSection
          application={application}
          withoutTitle
        />
      </$StatusSection>
      <$CompanySection>
        <EmployerCompanyFieldsSection application={application} />
      </$CompanySection>
      <$VoucherSection>
        <EmployerVoucherFieldsSection voucher={voucher} />
      </$VoucherSection>
      <$YouthSection>
        <YouthInfoFieldsSection voucher={voucher} />
      </$YouthSection>
      <$ContactSection>
        <EmployerContactPersonFieldsSection application={application} />
      </$ContactSection>
      <$PaymentSection>
        <EmployerPaymentFieldsSection application={application} />
      </$PaymentSection>
      <$InvoicerSection>
        <EmployerInvoicerFieldsSection application={application} />
      </$InvoicerSection>
      {messages && messages.length > 0 && (
        <div style={{ gridArea: 'messages', marginTop: '2rem' }}>
          <h3>{t('common:handlerApplication.messages')}</h3>
          {messages.map((message) => (
            <$Message key={message.id}>
              <p className="message-date">
                {convertToUIDateAndTimeFormat(message.created_at)}
              </p>
              <div className="message-content">
                {message.content
                  .split('\n')
                  .map((line: string, index: number) => (
                    <React.Fragment
                      key={[
                        ...line.replace(/\s+/g, '-'),
                        ['-'],
                        ...index.toString(),
                      ].join('')}
                    >
                      <p className="message-line">{line}</p>
                    </React.Fragment>
                  ))}
              </div>
            </$Message>
          ))}
        </div>
      )}
    </$PanelGrid>
  );
};

/**
 * Renders the handler's detail view of an employer application.
 *
 * Supports both modern 1-to-1 application-voucher layouts and historical/legacy
 * multi-voucher layouts (via a tabbed interface).
 */
const EmployerApplicationHandlerView: React.FC<Props> = ({ application }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.m})`);
  const [isNotificationOpen, setIsNotificationOpen] = useState(true);
  const [isMessageNotificationOpen, setIsMessageNotificationOpen] = useState(true);
  const { data: unreadCountData } = useUnreadMessagesCountQuery(application.id);
  const { mutate: markMessagesRead } = useMarkMessagesReadMutation(application.id);

  const closeLabel = 'common:common.close';
  const bottomRight = 'bottom-right';

  React.useEffect(() => {
    if (unreadCountData && unreadCountData.count > 0) {
      markMessagesRead();
    }
  }, [markMessagesRead, unreadCountData])

  const vouchers = application.summer_vouchers;

  if (vouchers.length === 0) {
    return <div data-testid="no-vouchers">-</div>;
  }
  const showMessageNotification =
    isMessageNotificationOpen && unreadCountData && unreadCountData.count > 0;

  if (vouchers.length === 1) {
    const voucher = vouchers[0];

    return (
      <>
        {showMessageNotification && (
          <Notification
            label={t('common:newMessages.title')}
            type="info"
            position={isMobile ? bottomRight : 'inline'}
            dismissible={isMobile}
            closeButtonLabelText={t(closeLabel)}
            onClose={() => setIsMessageNotificationOpen(false)}
            style={{ marginBottom: '2rem' }}
          >
            {t('common:newMessages.text')}
          </Notification>
        )}
        <EmployerApplicationPanel application={application} voucher={voucher} />
      </>
    );
  }

  return (
    <>
      {showMessageNotification && (
        <Notification
          label={t('common:newMessages.title')}
          type="info"
          position={isMobile ? bottomRight : 'inline'}
          dismissible={isMobile}
          closeButtonLabelText={t(closeLabel)}
          onClose={() => setIsMessageNotificationOpen(false)}
          style={{ marginBottom: '2rem' }}
        >
          {t('common:newMessages.text')}
        </Notification>
      )}
      {isNotificationOpen && vouchers.length > 1 && (
        <Notification
          label={t('common:handlerApplication.multipleVouchersNotification')}
          type="info"
          position={isMobile ? bottomRight : 'inline'}
          dismissible={isMobile}
          closeButtonLabelText={t(closeLabel)}
          onClose={() => setIsNotificationOpen(false)}
        />
      )}
      <$StickyTabs initiallyActiveTab={0}>
        <TabList>
          {vouchers.map((voucher, index) => (
            <Tab key={voucher.id || index}>
              {t('common:handlerApplication.voucherTab', {
                number: index + 1,
              })}
            </Tab>
          ))}
        </TabList>
        {vouchers.map((voucher, index) => (
          <TabPanel key={voucher.id || index}>
            <EmployerApplicationPanel
              application={application}
              voucher={voucher}
            />
          </TabPanel>
        ))}
      </$StickyTabs>
    </>
  );
};

export default EmployerApplicationHandlerView;
