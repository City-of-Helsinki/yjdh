const getFormattedDate = (date: string): string => {
  if (date) {
    const newDate = new Date(date);
    return `${newDate.getDate()}.${
      newDate.getMonth() + 1
    }.${newDate.getFullYear()}`;
  } else return '';
};

export default getFormattedDate;
