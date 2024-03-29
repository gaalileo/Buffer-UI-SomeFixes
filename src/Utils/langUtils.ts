
/**
 * Convert a string to a language key
 * @param input 
 * @returns key of given string
 */
export function toLangKey(input: string): string {
  return input?.toLowerCase()?.replace(/\s+/g, '-') ?? "";
}