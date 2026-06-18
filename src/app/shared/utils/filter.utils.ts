export function buildActiveFilters(values: Record<string, string | null>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(values).filter(
      (entry): entry is [string, string] => entry[1] !== null && entry[1] !== '',
    ),
  );
}
