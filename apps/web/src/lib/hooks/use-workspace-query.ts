'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { WorkspaceEventType, useWorkspaceEventListener } from './event-bus';

interface UseWorkspaceQueryOptions<T> {
  url: string;
  initialData?: T;
  invalidateOn?: WorkspaceEventType | WorkspaceEventType[];
  revalidateOnFocus?: boolean;
  pollIntervalMs?: number;
}

export function useWorkspaceQuery<T>({
  url,
  initialData,
  invalidateOn,
  revalidateOnFocus = true,
  pollIntervalMs,
}: UseWorkspaceQueryOptions<T>) {
  const [data, setData] = useState<T | undefined>(initialData);
  const [isLoading, setIsLoading] = useState<boolean>(!initialData);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const isMounted = useRef(true);

  const fetchQuery = useCallback(async (isBackground = false) => {
    if (!isBackground) {
      if (!data) setIsLoading(true);
      else setIsRefreshing(true);
    }

    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Query failed with status ${res.status}`);
      }
      const json = await res.json();
      if (isMounted.current) {
        if (json.success && json.data !== undefined) {
          setData(json.data);
        } else if (json.data !== undefined) {
          setData(json.data);
        } else {
          setData(json);
        }
        setError(null);
      }
    } catch (err: any) {
      if (isMounted.current) {
        setError(err);
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, [url, data]);

  useEffect(() => {
    isMounted.current = true;
    fetchQuery();

    return () => {
      isMounted.current = false;
    };
  }, [fetchQuery]);

  // Invalidate on event bus triggers
  const handleInvalidate = useCallback(() => {
    fetchQuery(true);
  }, [fetchQuery]);

  useWorkspaceEventListener(
    invalidateOn || ['workspace:invalidated'],
    handleInvalidate
  );

  // Revalidate on focus
  useEffect(() => {
    if (!revalidateOnFocus) return;

    const onFocus = () => fetchQuery(true);
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [revalidateOnFocus, fetchQuery]);

  // Optional background polling
  useEffect(() => {
    if (!pollIntervalMs) return;

    const interval = setInterval(() => {
      fetchQuery(true);
    }, pollIntervalMs);

    return () => clearInterval(interval);
  }, [pollIntervalMs, fetchQuery]);

  return {
    data,
    setData,
    isLoading,
    isRefreshing,
    error,
    refetch: () => fetchQuery(false),
  };
}
