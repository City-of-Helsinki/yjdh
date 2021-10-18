import { RenderResult } from '@testing-library/react';
import renderComponent from 'benefit/applicant/__tests__/utils/render-component';
import { ATTACHMENT_TYPES } from 'benefit/applicant/constants';
import { axe } from 'jest-axe';
import React from 'react';

import AttachmentsList, { AttachmentsListProps } from '../AttachmentsList';

describe('AttachmentsList', () => {
  const initialProps: AttachmentsListProps = {
    attachmentType: ATTACHMENT_TYPES.HELSINKI_BENEFIT_VOUCHER,
  };

  const getComponent = (
    props: Partial<AttachmentsListProps> = {}
  ): RenderResult =>
    renderComponent(<AttachmentsList {...initialProps} {...props} />)
      .renderResult;

  it('should render with no accessibility violations', async () => {
    const { container } = getComponent();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
