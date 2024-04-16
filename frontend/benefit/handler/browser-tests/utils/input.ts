import { Selector } from 'testcafe';

export const uploadFileAttachment = async (
  t: TestController,
  inputId: string,
  filename = 'sample.pdf'
): Promise<void> => {
  const filenameWithoutExtension = filename.replace(/\.\w+$/, '');
  await t.scrollIntoView(Selector(inputId).parent(), { offsetY: -200 });
  await t.setFilesToUpload(inputId, filename);
  await t
    .expect(
      Selector(inputId)
        .parent()
        .parent()
        .find(`a[aria-label^="${filenameWithoutExtension}"]`).visible
    )
    .ok();
};

export const clearAndFill = async (
  t: TestController,
  selector: string,
  value: string
): Promise<void> => {
  await t.click(selector);
  await t.selectText(selector);
  await t.pressKey('delete');
  await t.typeText(selector, value ?? '');
};
