import { memoize } from 'underscore'
import { isIE } from './is-ie'
import { functor } from '@zambezi/fun'

const upperCasePattern = /[A-Z]/g
const toDataAttribute = memoize(toDataAttributeFromPattern)

export function dataset (s, key, value) {
  const v = functor(value)
  if (isIE) s.attr(toDataAttribute(key), value)
  else s.each(setValue)
  function setValue () {
    this.dataset[key] = v.apply(this, arguments)
  }
}

function toDataAttributeFromPattern (key) {
  return 'data-' + key.replace(upperCasePattern, s => `-${s.toLowerCase()}`)
}
