export const prettyPrintObject = (object: {
  data: Record<string, string[]>;
}): string => {
  try {
    return JSON.stringify(object)
      .replaceAll(/["[\]{}]/g, '')
      .replaceAll(':', ': ')
      .replaceAll(/\s\s+(,)(\r|\n)/g, '\n')
      .replaceAll(/\s+(\r|\n)/g, '\n');
  } catch (error: unknown) {
    // eslint-disable-next-line no-console
    console.warn("Error: Can't print error object");
    return '';
  }
};
