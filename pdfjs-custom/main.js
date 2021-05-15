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

  /**
   * From config to PDFJS compliant settings
   */
  const shimSettingsFromConfigSettings = (configSettings) => {
    return {
      cursor: cursorTools(configSettings.cursor),
      scale: configSettings.scale,
      scrollMode: scrollMode(configSettings.scrollMode),
      spreadMode: spreadMode(configSettings.spreadMode),
      rotation: 0, // in degrees
      pageNumber: 1,
      scrollTop: 0,
      scrollLeft: 0,
    }
  }

  window.addEventListener(
    "load",
    () => {
      const config = loadConfig()

      let settings = shimSettingsFromConfigSettings(config.defaults)
      let documentReloading = false

      const applySettings = () => {
        // console.log(`Applying settings: ${JSON.stringify(settings)}`)
        PDFViewerApplication.pdfCursorTools.switchTool(settings.cursor)
        PDFViewerApplication.pdfViewer.currentScaleValue = settings.scale
        PDFViewerApplication.pdfViewer.scrollMode = settings.scrollMode
        PDFViewerApplication.pdfViewer.spreadMode = settings.spreadMode
        PDFViewerApplication.pdfViewer.pagesRotation = settings.rotation
        PDFViewerApplication.pdfViewer.currentPageNumber = settings.pageNumber
        document.getElementById("viewerContainer").scrollTop =
          settings.scrollTop
        document.getElementById("viewerContainer").scrollLeft =
          settings.scrollLeft
        documentReloading = false
      }

      const listenToSettingsChanges = () => {
        PDFViewerApplication.eventBus.on("updateviewarea", () => {
          const scrollTop = document.getElementById("viewerContainer").scrollTop
          const scrollLeft =
            document.getElementById("viewerContainer").scrollLeft
          if (!documentReloading) {
            console.log("updateviewarea")
            settings = {
              ...settings,
              scale: PDFViewerApplication.pdfViewer.currentScaleValue,
              scrollTop,
              scrollLeft,
            }
            console.log(JSON.stringify(settings))
          }
        })
        PDFViewerApplication.eventBus.on("cursortoolchanged", () => {
          // console.log("cursortoolchanged")
          settings = {
            ...settings,
            cursor: PDFViewerApplication.pdfCursorTools.activeTool,
          }
          // console.log(JSON.stringify(settings))
        })
        PDFViewerApplication.eventBus.on("scrollmodechanged", () => {
          // console.log("scrollmodechanged")
          settings = {
            ...settings,
            scrollMode: PDFViewerApplication.pdfViewer.scrollMode,
          }
          // console.log(JSON.stringify(settings))
        })
        PDFViewerApplication.eventBus.on("spreadmodechanged", () => {
          // console.log("spreadmodechanged")
          settings = {
            ...settings,
            spreadMode: PDFViewerApplication.pdfViewer.spreadMode,
          }
          // console.log(JSON.stringify(settings))
        })
        PDFViewerApplication.eventBus.on("rotatecw", () => {
          // console.log("rotatecw")
          settings = {
            ...settings,
            rotation: (settings.rotation + 90) % 360,
          }
          // console.log(JSON.stringify(settings))
        })
        PDFViewerApplication.eventBus.on("rotateccw", () => {
          // console.log("rotateccw")
          settings = {
            ...settings,
            rotation: (settings.rotation - 90) % 360,
          }
          // console.log(JSON.stringify(settings))
        })
      }

      const vscodeAPI = acquireVsCodeApi()
      PDFViewerApplication.open(config.path)
      PDFViewerApplication.initializedPromise.then(() => {
        listenToSettingsChanges()
        PDFViewerApplication.eventBus.on("pagesinit", () => {
          documentReloading = true
        })
        PDFViewerApplication.eventBus.on("textlayerrendered", () => {
          // console.log("textlayerrendered")
          if (documentReloading) {
            // This portion is fired every time the pdf is changed AND loaded successfully
            // just always close the sidebar--it's super annoying to maintain it.
            // https://github.com/lhl2617/VSLilyPond-PDF-preview/issues/22
            PDFViewerApplication.pdfSidebar.close()
            handleTextEditLinks(vscodeAPI)
            applySettings()
            // MUST BE AFTER APPLYING SETTINGS
            documentReloading = false
          }
        })
      })
      window.addEventListener("message", function () {
        window.PDFViewerApplication.open(config.path)
      })
    },
    { once: true }
  )

  window.onerror = function () {
    5
    const msg = document.createElement("body")
    msg.innerText =
      "An error occurred while loading the file. Please open it again."
    document.body = msg
  }
})()
