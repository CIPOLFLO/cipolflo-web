export function buildActiveFilters(values: Record<string, string | null>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(values).filter(
      (entry): entry is [string, string] => entry[1] !== null && entry[1] !== '',
    ),
  );
}

export function buildDefaultFilterValues(
  fields: { key: string; defaultValue?: string }[],
): Record<string, string | null> {
  return Object.fromEntries(
    fields.filter((f) => f.defaultValue != null).map((f) => [f.key, f.defaultValue!]),
  );
}
