// lib/departments.js
export const DEPARTMENTS = [
  { id: 'ib',       name: 'IB (Intelligence Branch)' },
  { id: 'cid',      name: 'CID (Criminal Investigation Department)' },
  { id: 'fa',       name: 'FA (Free Agent)' },
  { id: 'hrt',      name: 'HRT (Hostage Rescue Team)' },
  { id: 'atf',      name: 'ATF (Anti Terrorism Force)' },
  { id: 'af',       name: 'AF (Air Force)' },
  { id: 'ocu',      name: 'OCU (Organized Crime Unit)' },
  { id: 'dea',      name: 'DEA (Drug Enforcement Administration)' },
  { id: 'fna',      name: 'FNA (Federal National Academy)' },
  { id: 'nsb',      name: 'NSB (National Security Branch)' },
  { id: 'trainee',  name: 'TR (Trainee)' },
  { id: 'director', name: 'Director' },
  { id: 'cod',      name: 'Chief Of Discipline' },
  { id: 'assh',     name: 'Assistance of Sheriff' }
];

export const DEPARTMENT_IDS = DEPARTMENTS.map(d => d.id);

export function isValidDepartment(id) {
  if (id === undefined || id === null) return false;
  return DEPARTMENT_IDS.includes(String(id));
}
