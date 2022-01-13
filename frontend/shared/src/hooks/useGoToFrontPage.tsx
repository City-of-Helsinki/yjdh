import React from 'react';
import useGoToPage from 'shared/hooks/useGoToPage';

const useGoToFrontPage = (): (() => void) => {
  const goToPage = useGoToPage();
  return React.useCallback(() => goToPage('/'), [goToPage]);
};

export default useGoToFrontPage;
