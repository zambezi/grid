export function createRunExternalComponents() {

  const components = []

  function runExternalComponents(s) {
    components.forEach(c => s.call(c))
  }

  runExternalComponents.use = function(component) {
    components.push(component)
    return runExternalComponents
  }

  return runExternalComponents

}
