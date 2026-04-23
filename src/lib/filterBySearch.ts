// Tiny helper: case-insensitive substring match
export function matchesQuery(name: string, query: string): boolean {
  if (!query) return true;
  return name.toLowerCase().includes(query.toLowerCase().trim());
}
