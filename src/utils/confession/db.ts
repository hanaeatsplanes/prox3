export function nextId() {
  return 1; //todo: implement
}
export async function hasStaged(ts: string) {
  const stored = await redis.get(`dmts:${ts}`);
  return !!stored;
}
