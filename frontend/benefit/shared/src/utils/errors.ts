export const prettyPrintObject = (object: {
  data: Record<string, string[]>;
}): string => {
  try {
    return JSON.stringify(object)
      .replace(/["[\]{}]/g, '')
      .replace(/:/g, ': ')
      .replace(/\s\s+(,)(\r|\n)/g, '\n')
      .replace(/\s+(\r|\n)/g, '\n');
  } catch (error: unknown) {
    // eslint-disable-next-line no-console
    console.warn("Error: Can't print error object");
    return '';
  }
};
