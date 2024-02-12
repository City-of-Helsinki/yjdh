import { Selector } from 'testcafe';

import fi from '../../public/locales/fi/common.json';
import MainIngress from './MainIngress';
import Step1 from './step1';
import Step2 from './step2';

export type DeMinimisRow = {
  granter: string;
  amount: string;
  grantedAt: string;
};

export enum SAVE_ACTIONS {
  CONTINUE = 'continue',
  SAVE_AND_EXIT = 'saveAndExit',
}
class DeMinimisAid {
  public step1: Step1;

  public step2: Step2;

  public t: TestController;

  private selectors = {
    deMinimisRow: '[data-testid="deminimis-row"]',
    applicationEditButton: '[data-testid="application-edit-button"]',
    toastError: '.Toastify__toast-body[role="alert"]',
  };

  // eslint-disable-next-line class-methods-use-this
  private getSelectorContinueButton = (): Selector =>
    Selector('button').withText(fi.applications.actions.continue);

  fillMandatoryFields = async (): Promise<void> => {
    const mainIngress = new MainIngress();
    await mainIngress.isLoaded();
    await mainIngress.clickCreateNewApplicationButton();

    await this.step1.isLoaded(30_000);

    await this.step1.fillEmployerInfo('6051437344779954', false);
    await this.step1.fillContactPerson(
      'Tester',
      'Example',
      '050001234',
      'tester@example.com'
    );
    await this.step1.selectCoOperationNegotiations(false);
  };

  public getRowCount = async (): Promise<number> =>
    Selector(this.selectors.deMinimisRow).count;

  private step1ToStep2 = async (): Promise<void> => {
    await this.step1.clickSubmit();
    await this.step2.isLoaded();
  };

  private step2ToStep1 = async (): Promise<void> => {
    await this.step2.clickPrevious();
    await this.step1.isLoaded();
  };

  public saveExitAndEdit = async (t: TestController): Promise<void> => {
    await this.step1.clickSaveAndClose();
    const mainIngress = new MainIngress();
    await mainIngress.isLoaded();
    await t.click(Selector(this.selectors.applicationEditButton));
    await this.step1.isLoaded();
    await t.scrollIntoView(this.getSelectorContinueButton());
  };

  public actions = {
    saveStep1AndReturn: async (): Promise<void> => {
      await this.step1ToStep2();
      await this.step2ToStep1();
    },
    fillRows: async (
      t: TestController,
      rows: DeMinimisRow[],
      action?: SAVE_ACTIONS
    ): Promise<void> => {
      // eslint-disable-next-line no-restricted-syntax
      for (const row of rows) {
        // eslint-disable-next-line no-await-in-loop
        await this.step1.fillDeminimisAid(
          row.granter,
          row.amount,
          row.grantedAt
        );
      }
      if (action === SAVE_ACTIONS.CONTINUE) {
        await this.actions.saveStep1AndReturn();
        await t.scrollIntoView(this.getSelectorContinueButton());
        await t.expect(await this.getRowCount()).eql(rows.length);
      }
      if (action === SAVE_ACTIONS.SAVE_AND_EXIT) {
        await this.saveExitAndEdit(t);
        await t.expect(await this.getRowCount()).eql(rows.length);
      }
    },

    removeRow: async (index: number): Promise<void> =>
      this.step1.clickDeminimisRemove(index),

    removeAllRows: async (rows: DeMinimisRow[]): Promise<void> => {
      // eslint-disable-next-line no-restricted-syntax, @typescript-eslint/no-unused-vars
      for (const _ of rows) {
        // eslint-disable-next-line no-await-in-loop
        await this.step1.clickDeminimisRemove(0);
      }
    },

    fillTooBigAmounts: async (t: TestController): Promise<void> => {
      const rows = [
        { granter: 'One', amount: '2', grantedAt: '1.1.2023' },
        { granter: 'Two', amount: '299999', grantedAt: '2.2.2023' },
      ];
      await this.actions.fillRows(t, rows);

      const deminimisMaxError = Selector(
        '[data-testid="deminimis-maxed-notification"]'
      );
      await t.expect(await deminimisMaxError.exists).ok();
      await this.step1.expectSubmitDisabled();

      await this.actions.removeAllRows(rows);

      await t.expect(await this.getRowCount()).eql(0);
    },

    fillAndLeaveUnfinished: async (t: TestController): Promise<void> => {
      await this.step1.fillDeminimisAid('One', '1', '');
      await this.step1.clickSubmit();
      const toastError = Selector(this.selectors.toastError).withText(
        fi.applications.sections.company.notifications.deMinimisUnfinished.label
      );
      await t.expect(await toastError.exists).ok();
      await t.click(toastError.find(`[title="${fi.toast.closeToast}"]`));
    },

    clearRowsWithSelectNo: async (
      t: TestController,
      action: SAVE_ACTIONS
    ): Promise<void> => {
      await this.step1.selectDeMinimis(false);

      if (action === SAVE_ACTIONS.CONTINUE) {
        await this.actions.saveStep1AndReturn();
      }
      if (action === SAVE_ACTIONS.SAVE_AND_EXIT) {
        await this.saveExitAndEdit(t);
      }

      await this.step1.selectDeMinimis(true);
      await t.scrollIntoView(this.getSelectorContinueButton());
      await t.expect(await this.getRowCount()).eql(0);
    },
  };

  constructor(t: TestController, step1: Step1, step2: Step2) {
    this.t = t;
    this.step1 = step1;
    this.step2 = step2;
  }
}
export default DeMinimisAid;
