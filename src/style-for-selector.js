export function styleForSelector (selector, sheet) {
  let style
  const rules = sheet.cssRules
  const ruleExists = Array.prototype.some.call(rules, findRule)

  if (ruleExists) return style
  insertRule()
  return rules[rules.length - 1].style

  function findRule (r) {
    if (r.selectorText !== selector) return false
    style = r.style
    return true
  }

  function insertRule () {
    sheet.insertRule(selector + '{}', rules.length)
  }
}
