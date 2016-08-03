import { property } from '@zambezi/fun'

export function columnLayout(columns) {
  const result = validateAndSegregateColumns(columns)
  return result
}

function validateAndSegregateColumns(columns) {
  console.log('validateAndSegregateColumns', columns, property)
  return columns
}
