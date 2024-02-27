import { strictIncludes } from '~/utils/array';

// Excludes keys from an object
export function omit<T extends object, K extends keyof T>(obj: T, keys: K[]) {
  return Object.fromEntries(
    strictEntries(obj).filter(([key]) => !strictIncludes(keys, key))
  ) as Omit<T, K>;
}

export function pick<T extends object, K extends keyof T>(obj: T, keys: K[]) {
  return Object.fromEntries(
    strictEntries(obj).filter(([key]) => strictIncludes(keys, key))
  ) as Pick<T, K>;
}

// Type-safe wrapper for Object.entries
export function strictEntries<T extends object, K extends keyof T>(obj: T) {
  return Object.entries(obj) as Array<[K, T[K]]>;
}

// Type-safe wrapper for Object.keys
export function strictKeys<T extends object, K extends keyof T>(obj: T) {
  return Object.keys(obj) as Array<K>;
}

// Type-safe wrapper for Object.values
export function strictValues<T extends object, K extends keyof T>(obj: T) {
  return Object.values(obj) as Array<T[K]>;
}
