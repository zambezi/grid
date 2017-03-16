import { functor } from '@zambezi/fun'
import { select } from 'd3-selection'
import { selectionChanged } from '@zambezi/d3-utils'

const changed = selectionChanged()

export function updateTextIfChanged(d, i) {
  const format = d.column.format || String
      , text = functor(format(d.value))

  select(this)
      .select(changed.key(text))
      .select('.formatted-text')
        .text(text)

  changed.key(null)
}
