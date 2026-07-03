import { Tab, TabList, TabPanel, Tabs } from 'hds-react';
import { useTranslation } from 'next-i18next';
import React, { useState } from 'react';
import styled from 'styled-components';

import type HandlerEmployerApplication from '../../types/HandlerEmployerApplication';
import EmployerInfoSection from './EmployerInfoSection';
import YouthInfoSection from './YouthInfoSection';

type Props = {
  application: HandlerEmployerApplication;
};

const $PanelGrid = styled.div`
  display: flex;
  gap: 2rem;
  align-items: flex-start;
  flex-wrap: wrap;
  > section {
    flex: 1 1 400px;
    min-width: 0;
  }
`;

/**
 * Renders the handler's detail view of an employer application.
 *
 * Supports both modern 1-to-1 application-voucher layouts and historical/legacy
 * multi-voucher layouts (via a tabbed interface).
 */
const EmployerApplicationHandlerView: React.FC<Props> = ({ application }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(0);
  const vouchers = application.summer_vouchers;

  if (vouchers.length === 0) {
    return <div data-testid="no-vouchers">-</div>;
  }

  if (vouchers.length === 1) {
    const voucher = vouchers[0];

    return (
      <$PanelGrid>
        <EmployerInfoSection application={application} voucher={voucher} />
        <YouthInfoSection voucher={voucher} />
      </$PanelGrid>
    );
  }

  return (
    <Tabs index={activeTab} onChange={setActiveTab}>
      <TabList>
        {application.summer_vouchers.map((voucher, index) => (
          <Tab key={voucher.id || index}>
            {t('common:handlerApplication.voucherTab', { number: index + 1 })}
          </Tab>
        ))}
      </TabList>
      {vouchers.map((voucher, index) => (
        <TabPanel key={voucher.id || index}>
          <$PanelGrid>
            <EmployerInfoSection application={application} voucher={voucher} />
            <YouthInfoSection voucher={voucher} />
          </$PanelGrid>
        </TabPanel>
      ))}
    </Tabs>
  );
};

export default EmployerApplicationHandlerView;
