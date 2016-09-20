export function createRunExternalComponents() {

  function runExternalComponents(s) {
    s.each(runExternalComponentsEach)
  }

  return runExternalComponents

  function runExternalComponentsEach(d, i) {
    console.log('runExternalComponentsEach', d, this)
  }

}
