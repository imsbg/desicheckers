/**
 * URL, GitHub Pages Blog Detection & Friend Share Utilities for DesiCheckers
 */

import type { Language } from './translations';

export type AppPage = 'home' | 'terms';

export function isGithubBlogView(
  hostname: string = '',
  pathname: string = '',
  search: string = ''
): boolean {
  const host = hostname.toLowerCase();
  const path = pathname.toLowerCase();

  if (search) {
    const params = new URLSearchParams(search);
    const viewParam = params.get('view')?.toLowerCase();
    if (viewParam === 'game') return false;
    if (viewParam === 'blog') return true;
    if (params.get('room') || params.get('autostart')) return false;
  }

  if (host.includes('github.io') || path === '/checkers-blog') {
    return true;
  }

  return false;
}

export function detectPageFromUrl(pathname: string): AppPage {
  const cleanPath = pathname.replace(/\/+$/, '');
  if (/\/terms$/i.test(cleanPath)) {
    return 'terms';
  }
  return 'home';
}

export function buildFriendSharePayload(
  roomCode?: string | null,
  lang: Language = 'en',
  origin: string = typeof window !== 'undefined' ? window.location.origin : 'https://imsbg.github.io',
  pathname: string = typeof window !== 'undefined' ? window.location.pathname : '/'
): { url: string; title: string; text: string; fullMessage: string } {
  const cleanOrigin = origin.replace(/\/+$/, '');
  const cleanPath = pathname === '/' ? '' : pathname.replace(/\/+$/, '');
  const url = roomCode
    ? `${cleanOrigin}${cleanPath}/?room=${roomCode}`
    : `${cleanOrigin}${cleanPath || '/'}`;

  if (lang === 'or') {
    if (roomCode) {
      const title = `ରୁମ୍ ${roomCode} ରେ ମୋ ସହିତ ଚେକର୍ସ ଖେଳନ୍ତୁ!`;
      const text = `ଆସନ୍ତୁ ମୋ ସହିତ ଅନଲାଇନ୍ ଚେକର୍ସ ଖେଳିବା! ରୁମ୍ କୋଡ୍: ${roomCode} । ଖେଳିବା କିମ୍ବା ଲାଇଭ୍ ଦେଖିବା ପାଇଁ ଏହି ଲିଙ୍କ୍ ରେ କ୍ଲିକ୍ କରନ୍ତୁ:`;
      return {
        url,
        title,
        text,
        fullMessage: `${text}\n${url}`,
      };
    }

    const title = 'ଦେଶୀ ଚେକର୍ସ - ଅନଲାଇନ୍, ଏଆଇ ଏବଂ ୨-ଖେଳାଳି ଚେକର୍ସ';
    const text = 'ଆସନ୍ତୁ ମୋ ସହିତ ଅନଲାଇନ୍, ଏଆଇ କିମ୍ବା ଗୋଟିଏ ଫୋନ୍‌ରେ ୨ ଜଣ ଚେକର୍ସ ଖେଳିବା!';
    return {
      url,
      title,
      text,
      fullMessage: `${text}\n${url}`,
    };
  }

  if (roomCode) {
    const title = `Play Checkers in Room ${roomCode}!`;
    const text = `Join my online Checkers match! Room Code: ${roomCode}. Click below to play or spectate live:`;
    return {
      url,
      title,
      text,
      fullMessage: `${text}\n${url}`,
    };
  }

  const title = 'DesiCheckers - Online, AI & 2-Player Checkers';
  const text = 'Challenge me to Checkers online, vs Smart AI, or 2-Player on one phone!';
  return {
    url,
    title,
    text,
    fullMessage: `${text}\n${url}`,
  };
}
