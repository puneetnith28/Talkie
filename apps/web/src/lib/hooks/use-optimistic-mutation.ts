'use client';

import { useState, useCallback } from 'react';
import { WorkspaceEventType, emitWorkspaceEvent } from './event-bus';

interface MutationContext<TData> {
  previousData: TData;
}

interface UseOptimisticMutationOptions<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<any>;
  onMutate?: (variables: TVariables, currentData: TData) => TData;
  onSuccess?: (result: any, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables, context?: MutationContext<TData>) => void;
  onSettled?: (data: any, error: Error | null, variables: TVariables) => void;
  invalidates?: WorkspaceEventType | WorkspaceEventType[];
}

export function useOptimisticMutation<TData, TVariables>({
  mutationFn,
  onMutate,
  onSuccess,
  onError,
  onSettled,
  invalidates,
}: UseOptimisticMutationOptions<TData, TVariables>) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(
    async (
      variables: TVariables,
      currentDataState?: {
        data: TData;
        setData: React.Dispatch<React.SetStateAction<TData>>;
      }
    ) => {
      setIsPending(true);
      setError(null);

      let context: MutationContext<TData> | undefined;

      // 1. Optimistic Update
      if (currentDataState && onMutate) {
        context = { previousData: currentDataState.data };
        const optimisticResult = onMutate(variables, currentDataState.data);
        currentDataState.setData(optimisticResult);
      }

      try {
        const result = await mutationFn(variables);

        if (onSuccess) {
          onSuccess(result, variables);
        }

        // 2. Event bus cross-tab and cross-component invalidation
        if (invalidates) {
          const events = Array.isArray(invalidates) ? invalidates : [invalidates];
          events.forEach((evt) => emitWorkspaceEvent(evt, { variables, result }));
        }

        if (onSettled) {
          onSettled(result, null, variables);
        }

        return result;
      } catch (err: any) {
        setError(err);

        // 3. Rollback on failure
        if (currentDataState && context) {
          currentDataState.setData(context.previousData);
        }

        if (onError) {
          onError(err, variables, context);
        }

        if (onSettled) {
          onSettled(null, err, variables);
        }

        throw err;
      } finally {
        setIsPending(false);
      }
    },
    [mutationFn, onMutate, onSuccess, onError, onSettled, invalidates]
  );

  return {
    mutate,
    isPending,
    error,
  };
}
