export const prettyPrintObject = (object: {
  data: Record<string, string[]>;
}): string => {
  try {
    return JSON.stringify(object)
      .replace(/["[\]{}]/g, '')
      .replace(/:/g, ': ')
      .replace(/\s{2,1000}(,)(\r|\n)/g, '\n')
      .replace(/\s{1,1000}(\r|\n)/g, '\n');
  } catch (error: unknown) {
    // eslint-disable-next-line no-console
    console.warn("Error: Can't print error object");
    return '';
  }
};
