/**
 * Formats a dimension value for use in CSS styling.
 *
 * If the value is a number, it converts it to a string and appends 'px' to it.
 * If the value is a string, it returns the string as is.
 */
export function formatDimension(dimension: number | string) {
  return `${isNaN(+dimension) ? dimension : dimension.toString().trim() + 'px'}`;
}
