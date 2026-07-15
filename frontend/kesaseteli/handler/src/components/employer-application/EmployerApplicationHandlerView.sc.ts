import { Tabs } from 'hds-react';
import styled, { DefaultTheme } from 'styled-components';

export const $PanelGrid = styled.div`
  display: grid;
  gap: 2rem;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-areas:
    'status . .'
    'company voucher youth'
    'contact payment invoicer'
    'attachments attachments attachments';

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
      'invoicer'
      'attachments';
  }
`;

export const $StatusSection = styled.div`
  grid-area: status;
`;

export const $CompanySection = styled.div`
  grid-area: company;
`;

export const $VoucherSection = styled.div`
  grid-area: voucher;
  background-color: var(--color-fog-light);
`;

export const $YouthSection = styled.div`
  grid-area: youth;
  background-color: var(--color-bus-light);
`;

export const $ContactSection = styled.div`
  grid-area: contact;
`;

export const $PaymentSection = styled.div`
  grid-area: payment;
`;

export const $InvoicerSection = styled.div`
  grid-area: invoicer;
`;

export const $AttachmentsSection = styled.div`
  grid-area: attachments;
  // background-color: var(--color-silver-light);
`;

export const $StickyTabs = styled(Tabs)`
  div[class*='Tabs-module_tablistBar'] {
    position: sticky;
    top: 0;
    z-index: 1000;
    background-color: var(--color-white);
  }
`;
