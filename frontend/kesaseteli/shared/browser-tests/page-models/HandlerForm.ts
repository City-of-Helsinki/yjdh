import PageComponent from '@frontend/shared/browser-tests/page-models/PageComponent';
import { getErrorMessage } from '@frontend/shared/browser-tests/utils/testcafe.utils';
import { t } from 'testcafe';

import ActivatedYouthApplication from '../../src/types/activated-youth-application';

export default class HandlerForm<
  A extends ActivatedYouthApplication
> extends PageComponent {
  private expectedApplication?: A;

  public constructor(expectedApplication?: A) {
    super('handler-form');
    this.expectedApplication = expectedApplication;
  }

  private title = this.component.findByRole('heading', {
    name: /hakemuksen tiedot/i,
  });

  private notFound = this.component.findByRole('heading', {
    name: /hakemusta ei löytynyt/i,
  });

  private applicationField(id: keyof A | 'name') {
    return this.component.findByTestId(`handlerApplication-${id as string}`);
  }

  private acceptButton = this.component.findByRole('button', {
    name: /hyväksy/i,
  });

  private rejectButton = this.component.findByRole('button', {
    name: /hylkää/i,
  });

  private confirmDialog = this.component.findByRole('dialog');

  private confirmAcceptButton = this.within(this.confirmDialog).findByRole(
    'button',
    {
      name: /hyväksy/i,
    }
  );

  private confirmRejectButton = this.within(this.confirmDialog).findByRole(
    'button',
    {
      name: /hylkää/i,
    }
  );

  private notYetActivated = this.component.findByRole('heading', {
    name: /nuori ei ole vielä aktivoinut hakemusta/i,
  });

  private additionalInfoRequested = this.component.findByRole('heading', {
    name: /nuori ei ole vielä täyttänyt lisätietohakemusta/i,
  });

  private isAccepted = this.component.findByRole('heading', {
    name: /hyväksytty/i,
  });

  private isRejected = this.component.findByRole('heading', {
    name: /hylätty/i,
  });

  public applicantIsNotInTargetGroup(age: number) {
    return this.component.findByRole(
      this.regexp(`henkilö ei kuulu iän puolesta kohderyhmään (${age}-vuotias)`)
    );
  }

  public applicantsLastnameMismatches() {
    return this.component.findByRole(
      this.regexp(
        `Sukunimi poikkeaa hakemukselle syötetystä sukunimestä (Väärä sukunimi)`
      )
    );
  }

  public async applicationNotFound() {
    return t.expect(this.notFound.exists).ok(await getErrorMessage(t));
  }

  public async applicationFieldHasValue(
    key: keyof A | 'name',
    expectedValue?: string
  ) {
    if (!expectedValue && !this.expectedApplication) {
      throw new Error('you need either expected application or value to test');
    }
    const value = expectedValue ?? this.expectedApplication?.[key as keyof A];

    return t
      .expect(this.applicationField(key).textContent)
      .contains(value as string, await getErrorMessage(t));
  }

  async applicationIsNotYetActivated() {
    return t.expect(this.notYetActivated.exists).ok(await getErrorMessage(t));
  }

  async additionalInformationRequested() {
    return t
      .expect(this.additionalInfoRequested.exists)
      .ok(await getErrorMessage(t));
  }

  async confirmationDialogIsPresent() {
    return t.expect(this.confirmDialog.exists).ok(await getErrorMessage(t));
  }

  async applicationIsAccepted() {
    return t.expect(this.isAccepted.exists).ok(await getErrorMessage(t));
  }

  async applicationIsRejected() {
    return t.expect(this.isRejected.exists).ok(await getErrorMessage(t));
  }

  clickAcceptButton() {
    return t.click(this.acceptButton);
  }

  clickConfirmAcceptButton() {
    return t.click(this.confirmAcceptButton);
  }

  clickRejectButton() {
    return t.click(this.rejectButton);
  }

  clickConfirmRejectButton() {
    return t.click(this.confirmRejectButton);
  }
}
