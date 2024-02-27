export function truncateHash(
  input: string,
  startChars: number = 5,
  endChars: number = 4,
  separator = '...'
) {
  const prefix = '0x';
  if (input.length + prefix.length <= startChars + endChars) {
    return prefix + input;
  }

  const start = input.slice(0, startChars);
  const end = input.slice(-endChars);
  return `${prefix}${start}${separator}${end}`;
}
