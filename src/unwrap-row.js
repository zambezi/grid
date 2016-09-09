export function unwrap(wrappedRow) {
  if (!wrappedRow.wrappedByGrid) return wrappedRow
  return Object.getPrototypeOf(wrappedRow)
}
