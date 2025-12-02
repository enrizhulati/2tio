'use client';

import { useState, useEffect, useCallback } from 'react';
import { getUserId, setUserId, generateUserId } from '@/lib/api/twotion';

interface UseTwotionUserReturn {
  userId: string | null;
  isReady: boolean;
  isLoading: boolean;
  error: string | null;
  ensureUser: () => Promise<string>;
}

export function useTwotionUser(): UseTwotionUserReturn {
  const [userId, setUserIdState] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user ID from localStorage on mount
  useEffect(() => {
    const stored = getUserId();
    if (stored) {
      setUserIdState(stored);
      setIsReady(true);
    }
    setIsLoading(false);
  }, []);

  // Generate new user ID if needed
  const ensureUser = useCallback(async (): Promise<string> => {
    // Return existing user ID if we have one
    const existing = getUserId();
    if (existing) {
      setUserIdState(existing);
      setIsReady(true);
      return existing;
    }

    // Generate new user ID
    setIsLoading(true);
    setError(null);

    try {
      const newUserId = await generateUserId();
      setUserId(newUserId);
      setUserIdState(newUserId);
      setIsReady(true);
      return newUserId;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate user ID';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    userId,
    isReady,
    isLoading,
    error,
    ensureUser,
  };
}
