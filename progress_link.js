(function initSelfStudyProgress(root, factory) {
  const api = factory();
  root.SelfStudyProgress = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis, function createSelfStudyProgress() {
  'use strict';
  // Bản tóm tắt tiến độ tự học HS gửi về cổng trên lớp (specs/002 C2). Chỉ có số liệu học tập, không có tên/MSSV:
  // { v:1, level:'cd', date:'2026-11-04', correct:120, rank:'Hạ sĩ', streak:3, today:12, lessons:{ "3": [đọc%, luyện%] } }.
  // Đi trong phần # của địa chỉ (không qua máy chủ nào khác) rồi cổng kiểm lại bằng sanitize() trước khi lưu.
  const LEVELS = ['k10', 'k11', 'k12', 'tc', 'cd'];
  const MAX_LESSONS = 40;
  const MAX_ENCODED = 4000;
  const HASH_KEY = 'tien-do';

  const int = (value, max) => {
    const number = Math.floor(Number(value));
    return Number.isFinite(number) && number >= 0 ? Math.min(number, max) : 0;
  };

  function sanitize(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value) || value.v !== 1) return null;
    const level = String(value.level || '');
    if (!LEVELS.includes(level)) return null;
    const date = /^\d{4}-\d{2}-\d{2}$/.test(String(value.date || '')) ? String(value.date) : '';
    const lessons = {};
    const source = value.lessons && typeof value.lessons === 'object' && !Array.isArray(value.lessons) ? value.lessons : {};
    for (const [lesson, pair] of Object.entries(source).slice(0, MAX_LESSONS)) {
      const number = Number(lesson);
      if (!Number.isInteger(number) || number < 1 || number > 99 || !Array.isArray(pair)) continue;
      lessons[number] = [int(pair[0], 100), int(pair[1], 100)];
    }
    return {
      v: 1, level, date,
      correct: int(value.correct, 100000),
      rank: String(value.rank || '').replace(/[^\p{L}\p{N} ]/gu, '').slice(0, 30),
      streak: int(value.streak, 3650),
      today: int(value.today, 10000),
      lessons,
    };
  }

  function toBase64Url(text) {
    const bytes = new TextEncoder().encode(text);
    let binary = '';
    for (const byte of bytes) binary += String.fromCharCode(byte);
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function fromBase64Url(text) {
    const binary = atob(text.replace(/-/g, '+').replace(/_/g, '/'));
    return new TextDecoder().decode(Uint8Array.from(binary, char => char.charCodeAt(0)));
  }

  function encode(summary) {
    const clean = sanitize(summary);
    return clean ? toBase64Url(JSON.stringify(clean)) : '';
  }
  function decode(text) {
    const raw = String(text || '');
    if (!raw || raw.length > MAX_ENCODED || !/^[A-Za-z0-9_-]+$/.test(raw)) return null;
    try { return sanitize(JSON.parse(fromBase64Url(raw))); } catch (_) { return null; }
  }

  // Địa chỉ cổng để quay về: chỉ http/https, bỏ phần #; sai thì trả ''.
  function returnUrl(value) {
    try {
      const url = new URL(String(value || ''));
      if (url.protocol !== 'http:' && url.protocol !== 'https:') return '';
      if (url.username || url.password) return '';
      url.hash = '';
      return url.href;
    } catch (_) { return ''; }
  }

  return { LEVELS, HASH_KEY, MAX_ENCODED, sanitize, encode, decode, returnUrl };
});
