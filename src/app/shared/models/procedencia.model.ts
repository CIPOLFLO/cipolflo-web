export enum Procedencia {
  Sede = 'SEDE',
  Camping = 'CAMPING',
}

export const PROCEDENCIA_LABEL: Record<string, string> = {
  [Procedencia.Sede]: 'Sede',
  [Procedencia.Camping]: 'Camping',
};

export const PROCEDENCIA_OPTIONS = [
  { label: 'Sede', value: Procedencia.Sede },
  { label: 'Camping', value: Procedencia.Camping },
];
