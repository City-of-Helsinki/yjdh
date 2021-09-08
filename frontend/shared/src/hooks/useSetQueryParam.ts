import React from 'react';
import { setQueryParameter } from 'shared/utils/query.utils';

const useSetQueryParam = (param: string, value: string): void => {
  React.useEffect(() => setQueryParameter(param, value), [param, value]);
};

export default useSetQueryParam;
