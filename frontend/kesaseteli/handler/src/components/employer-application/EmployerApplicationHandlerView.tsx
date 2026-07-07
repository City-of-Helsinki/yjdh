import { Notification, Tab, TabList, TabPanel, Tabs } from 'hds-react';
import { useTranslation } from 'next-i18next';
import React, { useState } from 'react';
import styled, { DefaultTheme, useTheme } from 'styled-components';
import useMediaQuery from 'shared/hooks/useMediaQuery';

import type HandlerEmployerApplication from '../../types/HandlerEmployerApplication';
import { HandlerSummerVoucher } from '../../types/HandlerEmployerApplication';
import EmployerApplicationStatusSection from './EmployerApplicationStatusFieldsSection';
import EmployerCompanyFieldsSection from './EmployerCompanyFieldsSection';
import EmployerContactPersonFieldsSection from './EmployerContactPersonFieldsSection';
import EmployerInvoicerFieldsSection from './EmployerInvoicerFieldsSection';
import EmployerPaymentFieldsSection from './EmployerPaymentFieldsSection';
import EmployerVoucherAttachments from './EmployerVoucherAttachments';
import EmployerVoucherFieldsSection from './EmployerVoucherFieldsSection';
import YouthInfoFieldsSection from './YouthInfoFieldsSection';

type Props = {
  application: HandlerEmployerApplication;
};

const $PanelGrid = styled.div`
  display: grid;
  gap: 2rem;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-areas:
    'status . .'
    'company voucher youth'
    'contact payment invoicer';

  > div {
    padding: var(--spacing-m);
  }

  @media (max-width: ${(props: { theme: DefaultTheme }) =>
      props.theme.breakpoints.m}) {
    grid-template-columns: 1fr;
    grid-template-areas:
      'status'
      'company'
      'voucher'
      'youth'
      'contact'
      'payment'
      'invoicer';
  }
`;

const $StatusSection = styled.div`
  grid-area: status;
`;

const $CompanySection = styled.div`
  grid-area: company;
`;

const $VoucherSection = styled.div`
  grid-area: voucher;
  background-color: var(--color-fog-light);
`;

const $YouthSection = styled.div`
  grid-area: youth;
  background-color: var(--color-bus-light);
`;

const $ContactSection = styled.div`
  grid-area: contact;
`;

const $PaymentSection = styled.div`
  grid-area: payment;
`;

const $InvoicerSection = styled.div`
  grid-area: invoicer;
`;

const EmployerApplicationPanel: React.FC<
  Props & { voucher: HandlerSummerVoucher }
> = ({ application, voucher }) => (
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
      <EmployerVoucherAttachments voucher={voucher} />
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
  </$PanelGrid>
);

/**
 * Renders the handler's detail view of an employer application.
 *
 * Supports both modern 1-to-1 application-voucher layouts and historical/legacy
 * multi-voucher layouts (via a tabbed interface).
 */
const EmployerApplicationHandlerView: React.FC<Props> = ({ application }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.m})`);
  const [isNotificationOpen, setIsNotificationOpen] = useState(true);
  const vouchers = application.summer_vouchers;

  if (vouchers.length === 0) {
    return <div data-testid="no-vouchers">-</div>;
  }

  if (vouchers.length === 1) {
    const voucher = vouchers[0];

    return (
      <EmployerApplicationPanel application={application} voucher={voucher} />
    );
  }

  // NOTE: There should be multiple vouchers only in legacy cases.
  // These will be handled as new one-to-one applications in the future.
  console.warn(
    'Multiple vouchers for 1 employer application.',
    'This should happen only with legacy applications.',
    { application_id: application.id }
  );

  return (
    <>
      {isNotificationOpen && (
        <Notification
          label={t('common:handlerApplication.multipleVouchersNotification')}
          type="info"
          position={isMobile ? 'bottom-right' : 'inline'}
          dismissible={isMobile}
          closeButtonLabelText={t('common:common.close')}
          onClose={() => setIsNotificationOpen(false)}
        />
      )}
      <Tabs index={activeTab} onChange={setActiveTab}>
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
      </Tabs>
    </>
  );
};

export default EmployerApplicationHandlerView;
