import { format } from 'd3-format'
import { isUndefined } from 'underscore'

const formatSingleDigitPrecision = format('.1f'),
  formatInteger = format('.0f')

export function basicPrecisionPxFormatter (d) {
  if (isUndefined(d)) return null

  const res = d % 1
  return (
    (res < 0.05 || 1 - res < 0.05) ?
    formatInteger(d) : formatSingleDigitPrecision(d)
  ) + 'px'
}
