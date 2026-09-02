import { UseQueryResult } from '@tanstack/react-query';
import { useEffect, useEffectEvent } from 'react';

type QuerySideEffectHandlers<T, E = Error> = {
  onSuccess?: (data: T) => void;
  onError?: (error: E) => void;
  onErrorPredicate?: (error: E) => boolean;
};
function useQuerySideEffect<T, E = Error>(
  query: UseQueryResult<T, E>,
  handlers: QuerySideEffectHandlers<T, E>
): void {
  const { onSuccess, onError, onErrorPredicate } = handlers;

  // useEffectEvent wraps callbacks to maintain stable identity while always
  // seeing the latest closure values — cleaner than manual ref management
  const handleSuccess = useEffectEvent((data: T) => {
    onSuccess?.(data);
  });
  const handleError = useEffectEvent((error: E) => {
    onError?.(error);
  });
  const shouldHandleError = useEffectEvent(
    (error: E) => onErrorPredicate === undefined || onErrorPredicate(error)
  );

  // Run side effects only when query state genuinely changes
  useEffect(() => {
    if (query.isError && query.error && shouldHandleError(query.error)) {
      handleError(query.error);
    } else if (query.isSuccess) {
      handleSuccess(query.data);
    }
  }, [
    query.data,
    query.error,
    query.dataUpdatedAt,
    query.errorUpdatedAt,
    query.isError,
    query.isSuccess,
    query.status,
    handleSuccess,
    handleError,
    shouldHandleError,
  ]);
}

export default useQuerySideEffect;
