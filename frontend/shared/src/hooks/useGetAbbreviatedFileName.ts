const useGetAbbreviatedFileName = (fileName: string): string => {
  if (!fileName) {
    return '';
  }
  const lastDotIndex = fileName.lastIndexOf('.') ?? -1;
  const fileType = lastDotIndex >= 0 ? fileName.slice(lastDotIndex) : '';

  return fileName.length > 40
    ? `${fileName.slice(0, 40 - fileType.length - 3)}...${fileType}`
    : fileName;
};

export default useGetAbbreviatedFileName;
