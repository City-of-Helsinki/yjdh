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
