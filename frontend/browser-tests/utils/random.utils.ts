export const selectRandomValueFromArray = <T>(array: Array<T>): T =>
  selectRandomValuesFromArray(array, 1)[0];

export const selectRandomValuesFromArray = <T>(
  array: Array<T>,
  amount: number
): Array<T> => {
  const shuffled = array.sort(randomCompareFn);
  const index = amount < array.length ? amount : array.length;
  return shuffled.slice(0, index);
};

const randomCompareFn = () => 0.5 - Math.random();
