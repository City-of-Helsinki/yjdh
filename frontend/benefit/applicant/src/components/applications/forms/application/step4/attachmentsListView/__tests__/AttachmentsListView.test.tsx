import { RenderResult } from '@testing-library/react';
import renderComponent from 'benefit/applicant/__tests__/utils/render-component';
import { ATTACHMENT_TYPES } from 'benefit/applicant/constants';
import { axe } from 'jest-axe';
import React from 'react';

import AttachmentsListView, {
  AttachmentsListViewProps,
} from '../AttachmentsListView';

describe('AttachmentsListView', () => {
  const initialProps: AttachmentsListViewProps = {
    type: ATTACHMENT_TYPES.HELSINKI_BENEFIT_VOUCHER,
    title: 'Attachments',
    attachments: [],
  };

  const getComponent = (
    props: Partial<AttachmentsListViewProps> = {}
  ): RenderResult =>
    renderComponent(<AttachmentsListView {...initialProps} {...props} />);

  it('should render with no accessibility violations', async () => {
    const { container } = getComponent();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
