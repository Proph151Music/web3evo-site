// Type-safe wrapper for Array.prototype.includes
export function strictIncludes<T, U extends T>(arr: readonly U[], elem: T): elem is U {
  return arr.includes(elem as U);
}
