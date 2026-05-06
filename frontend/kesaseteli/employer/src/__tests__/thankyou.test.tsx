import renderPage from 'kesaseteli/employer/__tests__/utils/components/render-page';
import ThankYouPage from 'kesaseteli/employer/pages/thankyou';
import {
  expectAuthorizedReply,
  expectToCreateApplicationToBackend,
  expectToGetApplicationFromBackend,
  expectToGetCompanyFromBackend,
} from 'kesaseteli-shared/__tests__/utils/backend/backend-nocks';
import {
  BackendEndpoint,
  getBackendDomain,
} from 'kesaseteli-shared/backend-api/backend-api';
import nock from 'nock';
import FakeObjectFactory from 'shared/__tests__/utils/FakeObjectFactory';
import { screen, waitFor } from 'shared/__tests__/utils/test-utils';
import Application from 'shared/types/application';

const fakeObjectFactory = new FakeObjectFactory();

const expectToGetApplicationsWithAnyQuery = (
  applications: Application[]
): nock.Scope =>
  nock(getBackendDomain())
    .get(BackendEndpoint.EMPLOYER_APPLICATIONS)
    .query(true)
    .reply(200, applications, { 'Access-Control-Allow-Origin': '*' });

describe('frontend/kesaseteli/employer/src/pages/thankyou.tsx', () => {
  it('Should redirect to existing draft when "Add another" is clicked', async () => {
    const myDraft = {
      ...fakeObjectFactory.fakeApplication(),
      status: 'draft',
      is_mine: true,
    } as Application;
    const currentApplication = {
      ...fakeObjectFactory.fakeApplication(),
      status: 'submitted',
    } as Application;

    expectAuthorizedReply();
    expectToGetCompanyFromBackend();
    expectToGetApplicationFromBackend(currentApplication);
    expectToGetApplicationsWithAnyQuery([myDraft]);

    const spyPush = jest.fn();
    renderPage(ThankYouPage, {
      push: spyPush,
      query: { id: currentApplication.id },
    });

    const button = await screen.findByRole(
      'button',
      { name: /tee uusi hakemus/i },
      { timeout: 10_000 }
    );
    expect(button).toBeEnabled();

    button.click();

    await waitFor(() => {
      expect(spyPush).toHaveBeenCalledWith(
        expect.stringContaining(`application?id=${myDraft.id}`),
        undefined,
        expect.anything()
      );
    });
  });

  it('Should create new application when no draft exists', async () => {
    const newApplication = {
      ...fakeObjectFactory.fakeApplication(),
      status: 'draft',
    } as Application;
    const currentApplication = {
      ...fakeObjectFactory.fakeApplication(),
      status: 'submitted',
    } as Application;

    expectAuthorizedReply();
    expectToGetCompanyFromBackend();
    expectToGetApplicationFromBackend(currentApplication);
    expectToGetApplicationsWithAnyQuery([]);
    expectToCreateApplicationToBackend(newApplication);

    const spyPush = jest.fn();
    renderPage(ThankYouPage, {
      push: spyPush,
      query: { id: currentApplication.id },
    });

    const button = await screen.findByRole(
      'button',
      { name: /tee uusi hakemus/i },
      { timeout: 10_000 }
    );
    expect(button).toBeEnabled();

    button.click();

    await waitFor(() => {
      expect(spyPush).toHaveBeenCalledWith(
        expect.stringContaining(`application?id=${newApplication.id}`),
        undefined,
        expect.anything()
      );
    });
  });

  it('Should have "Add another" button disabled while loading', async () => {
    expectAuthorizedReply();
    expectToGetCompanyFromBackend();
    const application = fakeObjectFactory.fakeApplication();
    expectToGetApplicationFromBackend(application);

    // Delay the applications response to test loading state
    nock(getBackendDomain())
      .get(BackendEndpoint.EMPLOYER_APPLICATIONS)
      .query(true)
      .delay(1000)
      .reply(200, [], { 'Access-Control-Allow-Origin': '*' });

    renderPage(ThankYouPage, {
      query: { id: application.id },
      push: jest.fn(),
      replace: jest.fn(),
    });

    const button = await screen.findByRole(
      'button',
      { name: /ladataan hakemusta/i },
      { timeout: 10_000 }
    );

    expect(button).toBeDisabled();

    // Wait for loading to finish and button to be enabled
    await waitFor(() => expect(button).toBeEnabled(), { timeout: 10_000 });
  });
});
