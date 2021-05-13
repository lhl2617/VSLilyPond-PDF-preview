"use strict"
;(function () {
  function loadConfig() {
    const elem = document.getElementById("pdf-preview-config")
    if (elem) {
      return JSON.parse(elem.getAttribute("data-config"))
    }
    throw new Error("Could not load configuration.")
  }
  function cursorTools(name) {
    if (name === "hand") {
      return 1
    }
    return 0
  }
  function scrollMode(name) {
    switch (name) {
      case "vertical":
        return 0
      case "horizontal":
        return 1
      case "wrapped":
        return 2
      default:
        return -1
    }
  }
  function spreadMode(name) {
    switch (name) {
      case "none":
        return 0
      case "odd":
        return 1
      case "even":
        return 2
      default:
        return -1
    }
  }

  const handleTextEditLinks = (vscodeAPI) => {
    const annotationLayerElems =
      document.getElementsByClassName("annotationLayer")
    for (const annotationsLayerElem of annotationLayerElems) {
      const hyperlinks = annotationsLayerElem.getElementsByTagName("a")

      const handleOnClick = (e) => {
        const href = e.target.href
        const regexpTextEdit =
          /textedit:\/\/(?<filepath>.+):(?<lineStr>[0-9]+):(?<colStartStr>[0-9]+):(?<colEndStr>[0-9]+)/
        const match = regexpTextEdit.exec(href)
        if (match) {
          e.preventDefault()

          const { filepath, lineStr, colStartStr, colEndStr } = match.groups

          const line = parseInt(lineStr)
          const colStart = parseInt(colStartStr)
          const colEnd = parseInt(colEndStr)
          vscodeAPI.postMessage({
            command: "textedit",
            line: line,
            filepath: filepath,
            colStart: colStart,
            colEnd: colEnd,
          })
        }
      }

      for (var i = 0; i < hyperlinks.length; i++) {
        hyperlinks[i].onclick = handleOnClick
      }
    }
  }

  window.addEventListener(
    "load",
    () => {
      const config = loadConfig()
      const defaults = config.defaults
      const vscodeAPI = acquireVsCodeApi()
      PDFViewerApplication.open(config.path)
      PDFViewerApplication.initializedPromise.then(() => {
        PDFViewerApplication.eventBus.on("textlayerrendered", () => {
          if (defaults.sidebar) {
            PDFViewerApplication.pdfSidebar.open()
          } else {
            PDFViewerApplication.pdfSidebar.close()
          }
          PDFViewerApplication.pdfCursorTools.switchTool(
            cursorTools(defaults.cursor)
          )
          PDFViewerApplication.pdfViewer.currentScaleValue = defaults.scale
          PDFViewerApplication.pdfViewer.scrollMode = scrollMode(
            defaults.scrollMode
          )
          PDFViewerApplication.pdfViewer.spreadMode = spreadMode(
            defaults.spreadMode
          )
          handleTextEditLinks(vscodeAPI)
        })
      })
      window.addEventListener("message", function () {
        window.PDFViewerApplication.open(config.path)
      })
    },
    { once: true }
  )

  window.onerror = function () {
    const msg = document.createElement("body")
    msg.innerText =
      "An error occurred while loading the file. Please open it again."
    document.body = msg
  }
})()
