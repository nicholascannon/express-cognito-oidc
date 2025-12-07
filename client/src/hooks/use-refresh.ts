import { useEffect, useRef } from 'react';
import { useMe } from './use-me';

const REFRESH_INTERVAL = 1000 * 60 * 1; // 4.5 minutes

/**
 * A hook that refreshes the authentication token just before it expires,
 * if the user is authenticated.
 */
export function useRefresh() {
  const { me, loading } = useMe();
  const refreshTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (refreshTimeout.current) {
      clearTimeout(refreshTimeout.current);
      refreshTimeout.current = null;
    }

    if (!loading && me) {
      const doRefresh = async () => {
        try {
          await fetch('http://localhost:8000/auth/refresh', {
            method: 'POST',
            credentials: 'include',
          });
        } catch (e) {
          console.error(e);
          // Silently ignore errors here;
          // logout or error state will be handled elsewhere if needed
        }
      };

      refreshTimeout.current = setTimeout(() => {
        doRefresh();
      }, REFRESH_INTERVAL);
    }

    return () => {
      if (refreshTimeout.current) {
        clearTimeout(refreshTimeout.current);
      }
    };
  }, [me, loading]);
}
