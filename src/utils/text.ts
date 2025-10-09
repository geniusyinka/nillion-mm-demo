export function truncateDid(did: string, start = 12, end = 4): string {
  if (!did) return "";
  return `${did.slice(0, start)}...${did.slice(-end)}`;
}
