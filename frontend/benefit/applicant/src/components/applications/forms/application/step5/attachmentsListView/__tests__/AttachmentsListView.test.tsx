import { RenderResult } from '@testing-library/react';
import renderComponent from 'benefit/applicant/__tests__/utils/render-component';
import { ATTACHMENT_TYPES } from 'benefit-shared/constants';
import { axe } from 'jest-axe';
import React from 'react';

import AttachmentsListView, {
  AttachmentsListViewProps,
} from '../AttachmentsListView';

describe('AttachmentsListView', () => {
  const initialProps: AttachmentsListViewProps = {
    type: ATTACHMENT_TYPES.HELSINKI_BENEFIT_VOUCHER,
    title: 'Attachments',
    attachments: [
      {
        application: '9cfe273b-85d0-468e-b462-c8e5c04ce142',
        attachmentFile: 'http://localhost:8000/media/Contract.png',
        attachmentFileName: 'Contract.png',
        attachmentType: ATTACHMENT_TYPES.HELSINKI_BENEFIT_VOUCHER,
        contentType: 'image/png',
        createdAt: '2021-09-09T10:37:13.341633+03:00',
        id: '68034254-0dff-423d-8659-58864a930ae7',
      },
    ],
  };

  const getComponent = (
    props: Partial<AttachmentsListViewProps> = {}
  ): RenderResult =>
    renderComponent(<AttachmentsListView {...initialProps} {...props} />)
      .renderResult;

  it('should render with no accessibility violations', async () => {
    const { container } = getComponent();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
