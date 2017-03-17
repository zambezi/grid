export function createExportServerSideFilterAndSort () {
  let serverSideFilterAndSort = false

  function exportServerSideFilterAndSort (s) {
    s.each(exportServerSideFilterAndSortEach)
  }

  exportServerSideFilterAndSort.serverSideFilterAndSort = function (value) {
    if (!arguments.length) return serverSideFilterAndSort
    serverSideFilterAndSort = value
    return exportServerSideFilterAndSort
  }

  return exportServerSideFilterAndSort

  function exportServerSideFilterAndSortEach (d, i) {
    d.serverSideFilterAndSort = serverSideFilterAndSort
  }
}
