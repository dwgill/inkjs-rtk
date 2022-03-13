export function simpleSetFromArr(arr: string[] | null): Record<string, true> {
  const simpleMap: Record<string, true> = {};
  if (arr == null) return simpleMap;
  for (let i = 0; i < arr.length; i++) {
    simpleMap[arr[i]] = true;
  }
  return simpleMap;
}

export function simpleSetToArr(map: Record<string, true> | null): string[] {
  if (map == null) return [];
  return Object.keys(map);
}
