/**
 * Live Public Match Registry using BroadcastChannel for instant local/tab discovery
 */

import type { MatchTier } from '../game/checkers';

export const INACTIVITY_TIMEOUT_MS = 10 * 60 * 1000;

export interface LiveMatchListing {
  roomCode: string;
  hostName: string;
  guestName: string | null;
  status: 'waiting' | 'playing' | 'won' | 'draw';
  spectatorCount: number;
  forcedCapture: boolean;
  matchTier: MatchTier;
  updatedAt: number;
}

const STORAGE_KEY = 'sb_checkers_live_rooms_v1';
const CHANNEL_NAME = 'sb-checkers-live-lobby-v1';

class LiveMatchRegistry {
  private matches: Map<string, LiveMatchListing> = new Map();
  private listeners: Set<(matches: LiveMatchListing[]) => void> = new Set();
  private channel: BroadcastChannel | null = null;

  constructor() {
    this.loadFromStorage();
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        this.channel = new BroadcastChannel(CHANNEL_NAME);
        this.channel.onmessage = (event) => {
          const data = event.data;
          if (!data) return;
          if (data.type === 'UPSERT' && data.listing) {
            this.matches.set(data.listing.roomCode, data.listing);
            this.saveToStorage();
            this.notify();
          } else if (data.type === 'REMOVE' && data.roomCode) {
            this.matches.delete(data.roomCode);
            this.saveToStorage();
            this.notify();
          }
        };
      } catch {
        this.channel = null;
      }
    }
  }

  private loadFromStorage(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const list: LiveMatchListing[] = JSON.parse(raw);
      const now = Date.now();
      for (const item of list) {
        if (now - item.updatedAt < INACTIVITY_TIMEOUT_MS) {
          this.matches.set(item.roomCode, item);
        }
      }
    } catch {
      // ignore
    }
  }

  private saveToStorage(): void {
    try {
      const active = this.getLiveMatches();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(active));
    } catch {
      // ignore
    }
  }

  private notify(): void {
    const list = this.getLiveMatches();
    this.listeners.forEach((cb) => cb(list));
  }

  public getLiveMatches(): LiveMatchListing[] {
    const now = Date.now();
    const list: LiveMatchListing[] = [];
    for (const [code, item] of this.matches.entries()) {
      if (now - item.updatedAt >= INACTIVITY_TIMEOUT_MS) {
        this.matches.delete(code);
      } else {
        list.push(item);
      }
    }
    return list.sort((a, b) => b.updatedAt - a.updatedAt);
  }

  public upsertMatch(listing: LiveMatchListing): void {
    this.matches.set(listing.roomCode, listing);
    this.saveToStorage();
    this.channel?.postMessage({ type: 'UPSERT', listing });
    this.notify();
  }

  public removeMatch(roomCode: string): void {
    this.matches.delete(roomCode);
    this.saveToStorage();
    this.channel?.postMessage({ type: 'REMOVE', roomCode });
    this.notify();
  }

  public subscribe(cb: (matches: LiveMatchListing[]) => void): () => void {
    this.listeners.add(cb);
    cb(this.getLiveMatches());
    return () => {
      this.listeners.delete(cb);
    };
  }
}

export const liveMatchRegistry = new LiveMatchRegistry();
