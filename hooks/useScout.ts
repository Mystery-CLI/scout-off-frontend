'use client';
import { useState, useCallback, useRef } from 'react';
import useSWR from 'swr';
import { filterPlayers } from '@/lib/contract';
import type { Player, PlayerFilter } from '@/types';

/**
 * Cache key scheme for useScout:
 *   "scout:search:{region}:{position}:{minLevel}"
 *
 * All filter dimensions are encoded in the key so different filter combos
 * get separate caches. SWR deduplicates concurrent requests for the same
 * key, preventing duplicate RPC calls.
 */
function scoutSearchKey(filter: PlayerFilter): string {
  return `scout:search:${filter.region ?? ''}:${filter.position ?? ''}:${filter.minLevel ?? 0}`;
}

export function useScout() {
  const [searchKey, setSearchKey] = useState<string | null>(null);
  // Ref to bridge the search promise with SWR's async fetcher
  const resolveRef = useRef<((players: Player[]) => void) | null>(null);

  const { data, error, isValidating } = useSWR<Player[]>(
    searchKey,
    async (key: string) => {
      const parts = key.split(':');
      const region = parts[2] ?? '';
      const position = parts[3] ?? '';
      const minLevel = Number(parts[4] ?? 0);
      const results = await filterPlayers(region, position, minLevel);
      const players = results as Player[];
      // Resolve the pending search promise so callers can await completion
      resolveRef.current?.(players);
      resolveRef.current = null;
      return players;
    },
    {
      dedupingInterval: 60_000, // 60-second stale time — no duplicate RPC calls within this window
      revalidateOnFocus: false,
      errorRetryCount: 2,
    },
  );

  const search = useCallback(
    async (filter: PlayerFilter): Promise<Player[]> => {
      const key = scoutSearchKey(filter);
      setSearchKey(key);
      // Return a promise that resolves when the SWR fetcher completes
      return new Promise<Player[]>((resolve) => {
        resolveRef.current = resolve;
      });
    },
    [],
  );

  return {
    players: data ?? [],
    loading: isValidating,
    error: error?.message ?? null,
    search,
  };
}
