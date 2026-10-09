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
    'attachments attachments attachments'
    'messages messages messages';

  > div {
    padding: var(--spacing-m);
  }

  /* Align HDS Tooltip icons with heading text */
  div[class*='Tooltip-module_root'] {
    display: inline-flex;
    align-items: center;
    vertical-align: middle;

    button {
      display: inline-flex;
      align-items: center;
      line-height: 1;

      span {
        display: inline-flex;
        align-items: center;
      }

      svg {
        display: block;
        position: relative;
        top: -2px;
      }
    }
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
      'attachments'
      'messages';
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

export const $Message = styled.div`
  padding: var(--spacing-xs);
  border: 1px dashed var(--color-bus);
  margin: var(--spacing-s);
  background-color: var(--color-bus-light);

  &:last-child {
    border-bottom: none;
  }

  p[class*='message-date'] {
    font-weight: bold;
    margin-bottom: var(--spacing-xs);
  }

  div[class*='StatusLabel'] {
    margin-bottom: 0;
  }

  div[class*='message-content'] {
    padding: 0 1em 1em 1em;
  }

  p[class*='message-line'] {
    margin-bottom: 0;
  }
`;
