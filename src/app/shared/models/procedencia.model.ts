export enum Procedencia {
  Sede = 'Sede',
  Camping = 'Camping',
}

export const PROCEDENCIA_OPTIONS = Object.values(Procedencia).map((v) => ({
  label: v,
  value: v,
}));
