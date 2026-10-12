// lib/ranks.js
export const RANKS = [
  { value: 'director', num: null, label: 'Director' },
  { value: '15',       num: 15,   label: 'Deputy of Director' },
  { value: '14',       num: 14,   label: 'Advisor of Director' },
  { value: '13',       num: 13,   label: 'Assistant of Director' },
  { value: '12',       num: 12,   label: 'Head of Department' },
  { value: '11',       num: 11,   label: 'Dep. Head of Department' },
  { value: '10',       num: 10,   label: 'Instructor of Department' },
  { value: '9',        num: 9,    label: 'Free Agent' },
  { value: '8',        num: 8,    label: 'Intelligence Agent' },
  { value: '7',        num: 7,    label: 'Criminalistic Agent' },
  { value: '6',        num: 6,    label: 'Secret Agent' },
  { value: '5',        num: 5,    label: 'Special Agent' },
  { value: '4',        num: 4,    label: 'Senior Agent' },
  { value: '3',        num: 3,    label: 'Agent' },
  { value: '2',        num: 2,    label: 'Jr. Agent' },
  { value: '1',        num: 1,    label: 'Trainee' },
];

export function getRankLabel(value) {
  if (value === undefined || value === null || value === '') return null;
  const r = RANKS.find(x => x.value === String(value));
  if (!r) return null;
  return r.num ? `${r.num} · ${r.label}` : r.label;
}

export function getRankShort(value) {
  if (value === undefined || value === null || value === '') return null;
  const r = RANKS.find(x => x.value === String(value));
  if (!r) return null;
  return r.num ? String(r.num) : 'DIR';
}

export function getRankNumber(value) {
  const r = RANKS.find(x => x.value === String(value));
  return r && r.num ? r.num : null;
}

export function isValidRank(value) {
  if (value === undefined || value === null) return false;
  return RANKS.some(x => x.value === String(value));
}
