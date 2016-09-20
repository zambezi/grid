import { rebind } from '@zambezi/d3-utils'

export function createShareDispatcher() {
  let dispatcher = null
  function shareDispatcher(d, i) {
    d.dispatcher = dispatcher
  }

  shareDispatcher.dispatcher = function(value) {
    if (!arguments.length) return dispatcher
    dispatcher = rebind().from(value, 'on')({})
    return shareDispatcher
  }

  return shareDispatcher
}
