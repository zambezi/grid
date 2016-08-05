// Create a new proxy object on which we'll set the grid's transient properties.
// We can still access the original row's properties through it.
export function wrap(row) {
  if (row.wrapped) return row
  const wrappedRow = Object.create(row)
  Object.defineProperty(wrappedRow, 'wrappedByGrid', { value: true })
  return wrappedRow
}
