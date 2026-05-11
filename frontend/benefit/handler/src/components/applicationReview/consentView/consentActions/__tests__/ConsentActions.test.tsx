import { fireEvent, screen } from '@testing-library/react';
import renderComponent from 'benefit/handler/__tests__/utils/render-component';
import { ATTACHMENT_TYPES } from 'benefit-shared/constants';
import React from 'react';
import { ATTACHMENT_CONTENT_TYPES } from 'shared/constants/attachment-constants';

import ConsentActions from '../ConsentActions';

const renderSubject = (
  props: React.ComponentProps<typeof ConsentActions> = {}
): ReturnType<typeof renderComponent> =>
  renderComponent(<ConsentActions {...props} />);

// UploadAttachment renders a hidden native file input without accessible name,
// so we target it by its stable id to exercise the real upload flow.
/* eslint-disable testing-library/no-node-access, unicorn/prefer-query-selector */
const getUploadInput = (): HTMLInputElement =>
  document.getElementById(
    `upload_attachment_${ATTACHMENT_TYPES.EMPLOYEE_CONSENT}`
  ) as HTMLInputElement;
/* eslint-enable testing-library/no-node-access, unicorn/prefer-query-selector */

describe('ConsentActions', () => {
  it('renders upload UI and safely handles file input when upload handler is omitted', () => {
    renderSubject();

    expect(
      screen.getByRole('button', { name: /liitä uusi tiedosto/i })
    ).toBeInTheDocument();

    const uploadInput = getUploadInput();
    const file = new File(['consent'], 'consent.pdf', {
      type: 'application/pdf',
    });

    expect(uploadInput).toBeInTheDocument();
    expect(uploadInput.type).toBe('file');
    expect(uploadInput.accept).toBe(ATTACHMENT_CONTENT_TYPES.join(', '));

    expect(() => {
      fireEvent.change(uploadInput, {
        target: { files: [file] },
      });
    }).not.toThrow();
  });

  it('shows loading state when isUploading is true', () => {
    renderSubject({ isUploading: true });

    expect(screen.getByRole('button', { name: /ladataan/i })).toBeDisabled();
  });

  it('calls handleUpload with form data that includes attachment type and file', () => {
    const handleUpload = jest.fn();
    renderSubject({ handleUpload });

    const file = new File(['consent'], 'consent.pdf', {
      type: 'application/pdf',
    });

    fireEvent.change(getUploadInput(), {
      target: { files: [file] },
    });

    expect(handleUpload).toHaveBeenCalledTimes(1);

    const formData = handleUpload.mock.calls[0][0] as FormData;

    expect(formData.get('attachment_type')).toBe(
      ATTACHMENT_TYPES.EMPLOYEE_CONSENT
    );
    expect(formData.get('attachment_file')).toBe(file);
  });
});
