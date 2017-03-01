export function createRunExternalComponents() {

  let components = []

  function runExternalComponents(s) {
    components.forEach(c => s.call(c))
  }

  runExternalComponents.components = function(value) {
    if (!arguments.length) return components
    components = value
    return runExternalComponents
  }

  runExternalComponents.use = function(component) {
    components.push(component)
    return runExternalComponents
  }

  return runExternalComponents

}
