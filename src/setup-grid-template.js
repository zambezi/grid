import { appendIfMissing } from '@zambezi/d3-utils'
import { defaultTemplate } from './basic-grid-template'
import { isIE } from './is-ie'
import { select } from 'd3-selection'

export function createSetupGridTemplate () {
  const appendStirrup = appendIfMissing('div.zambezi-grid-stirrup')
  let template = defaultTemplate

  function setupTemplate (s) {
    s.each(setupTemplateEach)
  }

  setupTemplate.template = function (value) {
    if (!arguments.length) return template
    template = value
    return setupTemplate
  }

  return setupTemplate

  function setupTemplateEach (d, i) {
    const target = select(this),
      stirrup = target.select('.zambezi-grid-stirrup')

    if (stirrup.empty()) {
      target.classed('zambezi-grid', true)
            .classed('is-ie', isIE)
          .select(appendStirrup)
            .html(template)
    }
  }
}
