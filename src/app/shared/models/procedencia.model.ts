export enum Procedencia {
  Sede = 'SEDE',
  Camping = 'CAMPING',
  Ambos = 'AMBOS',
}

export const PROCEDENCIA_LABEL: Record<string, string> = {
  [Procedencia.Sede]: 'Sede',
  [Procedencia.Camping]: 'Camping',
  [Procedencia.Ambos]: 'Ambos',
};

export const PROCEDENCIA_OPTIONS = [
  { label: 'Sede', value: Procedencia.Sede },
  { label: 'Camping', value: Procedencia.Camping },
  { label: 'Ambos', value: Procedencia.Ambos },
];
