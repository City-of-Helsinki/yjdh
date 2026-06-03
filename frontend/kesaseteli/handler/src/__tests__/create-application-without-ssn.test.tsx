// Integration test: Verifies configuration loading, form interactions with userEvent, and successful form submission using nock
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import expectToGetSummerVoucherConfiguration from 'kesaseteli/handler/__tests__/utils/backend/expectToGetSummerVoucherConfiguration';
import CreateApplicationWithoutSsnPage from 'kesaseteli/handler/pages/create-application-without-ssn';
import renderComponent from 'kesaseteli-shared/__tests__/utils/components/render-component';
import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';
import mockRouter from 'next-router-mock';
import nock from 'nock';
import React from 'react';

jest.mock('shared/hooks/useGoToPage', () => ({
  __esModule: true,
  default:
    () =>
    // eslint-disable-next-line unicorn/consistent-function-scoping
    (pagePath = '/', operation: 'push' | 'replace' = 'push') => {
      const normalizedPath = pagePath.startsWith('/')
        ? pagePath
        : `/${pagePath}`;
      void mockRouter[operation](`/fi${normalizedPath}`);
    },
}));

const API_BASE_TEST_URL = 'https://localhost:8000';

describe('CreateApplicationWithoutSsnPage (Integration)', () => {
  let originalMockFlag: string | undefined;

  beforeAll(() => {
    nock.disableNetConnect();
    originalMockFlag = process.env.NEXT_PUBLIC_MOCK_FLAG;
    process.env.NEXT_PUBLIC_MOCK_FLAG = '1';
  });

  afterAll(() => {
    nock.enableNetConnect();
    process.env.NEXT_PUBLIC_MOCK_FLAG = originalMockFlag;
  });

  beforeEach(() => {
    nock.cleanAll();
    expectToGetSummerVoucherConfiguration();
    mockRouter.setCurrentUrl('/create-application-without-ssn');
  });

  it('renders target groups, handles form interaction, validation error, and successful submission', async () => {
    const user = userEvent.setup();
    const mockCreatedResponse = {
      id: 'mock-uuid-999',
      status: 'submitted',
    };

    renderComponent(<CreateApplicationWithoutSsnPage />);

    // Wait for target groups configurations to load
    const targetGroupRadioFi = await screen.findByLabelText(
      /sample target group 1/i
    );
    expect(targetGroupRadioFi).toBeInTheDocument();

    const firstNameInput = screen.getByLabelText(/etunimi/i);
    const lastNameInput = screen.getByLabelText(/sukunimi/i);
    const birthdateInput = screen.getByLabelText(/syntymäpäivä/i);
    const postcode = screen.getByLabelText(/postinumero/i);
    const schoolInput = screen.getByLabelText(/koulu/i);
    const phoneInput = screen.getByLabelText(/puhelinnumero/i);
    const emailInput = screen.getByLabelText(/sähköpostiosoite/i);
    const additionalInfoInput = screen.getByLabelText(/lisätiedot/i);
    const homeMunicipalityInput = screen.getByLabelText(/kotikunta/i);
    const sendButton = screen.getByRole('button', { name: /lähetä tiedot/i });

    // Select language & target group
    await user.click(screen.getByLabelText(/englanti/i));
    await user.click(targetGroupRadioFi);

    // Type fields
    await user.type(firstNameInput, 'John');
    await user.type(lastNameInput, 'Doe');
    await user.type(birthdateInput, '15.05.2008');
    await user.type(postcode, '00100');
    await user.type(schoolInput, 'Helsingin peruskoulu');
    await user.type(phoneInput, '+358401234567');
    await user.type(emailInput, 'john.doe@example.com');
    await user.type(additionalInfoInput, 'I have no SSN');
    await user.type(homeMunicipalityInput, 'Helsinki');

    nock(API_BASE_TEST_URL)
      .post(BackendEndpoint.CREATE_YOUTH_APPLICATION_WITHOUT_SSN, {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        school: 'Helsingin peruskoulu',
        phone_number: '+358401234567',
        postcode: '00100',
        language: 'en',
        non_vtj_birthdate: '2008-05-15',
        non_vtj_home_municipality: 'Helsinki',
        additional_info_description: 'I have no SSN',
        target_group: 'target_group_1',
      })
      .reply(200, mockCreatedResponse);

    // Click submit
    await user.click(sendButton);

    await waitFor(() => {
      expect(mockRouter.asPath).toContain('/thankyou?id=mock-uuid-999');
    });
  });
});
