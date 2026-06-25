import { RenderResult, screen, waitFor } from '@testing-library/react';
import renderComponent from 'benefit/handler/__tests__/utils/render-component';
import { setupUserAndRender } from 'benefit/handler/__tests__/utils/user-render-helper';
import AlterationCsvButton from 'benefit/handler/components/alterationHandling/AlterationCsvButton';
import useUpdateApplicationAlterationWithCsvQuery from 'benefit/handler/hooks/useUpdateApplicationAlterationWithCsvQuery';
import { ALTERATION_STATE, ALTERATION_TYPE } from 'benefit-shared/constants';
import { ApplicationAlteration } from 'benefit-shared/types/application';
import { ButtonPresetTheme, ButtonTheme } from 'hds-react';
import React from 'react';
import { downloadFile } from 'shared/utils/file.utils';

jest.mock('benefit/handler/hooks/useUpdateApplicationAlterationWithCsvQuery');
jest.mock('shared/utils/file.utils', () => ({
  downloadFile: jest.fn(),
}));

const mutateAsync = jest.fn();
const onSubmit = jest.fn();

const mockUseUpdateApplicationAlterationWithCsvQuery =
  useUpdateApplicationAlterationWithCsvQuery as jest.MockedFunction<
    typeof useUpdateApplicationAlterationWithCsvQuery
  >;

const mockDownloadFile = downloadFile as jest.MockedFunction<
  typeof downloadFile
>;

const labels = {
  button: 'Lataa maksatustiedot (csv)',
};

const alteration = {
  id: 1,
  application: 'app-id',
  alterationType: ALTERATION_TYPE.SUSPENSION,
  state: ALTERATION_STATE.HANDLED,
  endDate: '2024-06-30',
  resumeDate: '2024-07-15',
  contactPersonName: 'Maija Meikäläinen',
  useEinvoice: false,
  reason: 'Temporary suspension',
} as ApplicationAlteration;

const values = {
  application: 'app-id',
  recoveryStartDate: '01.07.2024',
  recoveryEndDate: '31.07.2024',
  recoveryAmount: '123,45',
  recoveryJustification: 'Peruste',
  isRecoverable: true,
  isManual: false,
  manualRecoveryAmount: '0',
} as const;

const renderSubject = ({
  props = {},
  isPending = false,
}: {
  props?: Partial<React.ComponentProps<typeof AlterationCsvButton>>;
  isPending?: boolean;
} = {}): RenderResult => {
  mockUseUpdateApplicationAlterationWithCsvQuery.mockReturnValue({
    mutateAsync,
    isPending,
  } as never);

  return renderComponent(
    <AlterationCsvButton
      alteration={alteration}
      values={values}
      theme={ButtonPresetTheme.Black as unknown as ButtonTheme}
      onSubmit={onSubmit}
      {...props}
    />
  ).renderResult;
};

describe('AlterationCsvButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mutateAsync.mockResolvedValue(new Blob(['csv-content']));
  });

  it('renders nothing when values are missing', () => {
    const { container } = renderSubject({ props: { values: undefined } });

    expect(container).toBeEmptyDOMElement();
  });

  it('disables the button when alteration is invalid or download is in progress', () => {
    const { rerender } = renderSubject({ props: { isAlterationValid: false } });

    expect(screen.getByRole('button', { name: labels.button })).toBeDisabled();

    mockUseUpdateApplicationAlterationWithCsvQuery.mockReturnValue({
      mutateAsync,
      isPending: true,
    } as never);

    rerender(
      <AlterationCsvButton
        alteration={alteration}
        values={values}
        theme={ButtonPresetTheme.Black as unknown as ButtonTheme}
        onSubmit={onSubmit}
      />
    );

    expect(screen.getByTestId('button-download-alteration-csv')).toBeDisabled();
  });

  it('updates the alteration, downloads the csv, and calls onSubmit', async () => {
    const response = new Blob(['csv-content']);

    mutateAsync.mockResolvedValue(response);
    const user = setupUserAndRender(() => {
      renderSubject();
    });

    await user.click(screen.getByRole('button', { name: labels.button }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        id: '1',
        applicationId: 'app-id',
        data: {
          application: 'app-id',
          recovery_start_date: '2024-07-01',
          recovery_end_date: '2024-07-31',
          recovery_amount: '123.45',
          recovery_justification: 'Peruste',
          is_recoverable: true,
        },
      });
    });

    expect(mockDownloadFile).toHaveBeenCalledWith(response, 'csv');
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('does not download or submit when the update fails', async () => {
    mutateAsync.mockRejectedValue(new Error('request failed'));
    const user = setupUserAndRender(() => {
      renderSubject();
    });

    await user.click(screen.getByRole('button', { name: labels.button }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledTimes(1);
    });

    expect(mockDownloadFile).not.toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
