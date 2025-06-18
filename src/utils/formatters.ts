/**
 * Removes formatting from a number string (e.g. removes commas) and ensures correct decimal structure.
 * @param value A formatted number as string
 * @returns A plain number string without commas or invalid characters
 */
export function deFormatNumber(value: string): string {
  value = value.replace(/[^\d\.]/g, '');
  const firstDot = value.indexOf('.');
  if (firstDot !== -1) {
    value =
      value.slice(0, firstDot + 1) +
      value.slice(firstDot + 1).replace(/\./g, '');
  }

  let [intPart, decPart] = value.split('.');
  intPart = intPart.replace(/^0+(?=\d)/, '');
  if (intPart === '') intPart = '0';
  value = decPart !== undefined ? `${intPart}.${decPart}` : intPart;

  return value;
}

/**
 * Formats a number string by adding thousand separators and preserving decimals.
 * @param value A number or string to format
 * @returns A formatted string with commas
 */
export function formatNumber(value: string | number): string {
  value = String(value);
  value = value.replace(/[^\d\.]/g, '');
  const firstDot = value.indexOf('.');
  if (firstDot !== -1) {
    value =
      value.slice(0, firstDot + 1) +
      value.slice(firstDot + 1).replace(/\./g, '');
  }

  const endWithDot = value.endsWith('.');
  if (endWithDot) {
    value = value.slice(0, -1);
  }

  let [intPart, decPart] = value.split('.');
  intPart = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  intPart = intPart.replace(/^0+(?=\d)/, '');
  if (intPart === '') intPart = '0';
  value = decPart !== undefined ? `${intPart}.${decPart}` : intPart;

  if (endWithDot) {
    value = value + '.';
  }

  return value;
}
