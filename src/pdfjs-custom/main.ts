// eslint-disable-next-line @typescript-eslint/naming-convention
declare var PDFViewerApplication: any

const vscodeAPI: {
  postMessage: (msg: WebviewVSCodeMessage) => any
  // @ts-ignore
} = acquireVsCodeApi()

const textEditRegExp =
  /textedit:\/\/(?<filepath>.+):(?<lineStr>[0-9]+):(?<colStr>[0-9]+):(?<unused>[0-9]+)/
type TextEditRegExpMatchType = {
  groups: { filepath: string; lineStr: string; colStr: string }
}

const logToVscode = (message: string) => {
  const msg: WebviewVSCodeLogMessage = {
    type: "log",
    message,
  }
  vscodeAPI.postMessage(msg)
}

const errorToVscode = (errorMessage: string) => {
  const msg: WebviewVSCodeErrorMessage = {
    type: "error",
    errorMessage,
  }
  vscodeAPI.postMessage(msg)
}

const loadConfig = () => {
  const config = document
    .getElementById("pdf-preview-config")
    ?.getAttribute("data-config")
  if (config) {
    return JSON.parse(config) as PDFViewerConfig
  }
  throw new Error("Could not load configuration.")
}

const getCodeLocationFromMatchGroups = (match: TextEditRegExpMatchType) => {
  const { filepath, lineStr, colStr } = match.groups
  const line = parseInt(lineStr)
  const col = parseInt(colStr)
  const codeLocation = {
    filepath: filepath,
    line: line,
    col: col,
  }
  return codeLocation
}

const handleTextEditLinks = async () => {
  try {
    const annotationLayerElems =
      document.getElementsByClassName("annotationLayer")

    for (const annotationsLayerElem of annotationLayerElems) {
      const hyperlinks = annotationsLayerElem.getElementsByTagName("a")

      const handleOnClick =
        (codeLocation: LilyPondCodeLocation) => (e: MouseEvent) => {
          e.preventDefault()
          const msg: WebviewVSCodeTextEditMessage = {
            type: "textedit",
            codeLocation,
          }
          vscodeAPI.postMessage(msg)
        }

      for (var i = 0; i < hyperlinks.length; i++) {
        const match = textEditRegExp.exec(hyperlinks[i].href)
        if (match) {
          const codeLocation = getCodeLocationFromMatchGroups(
            match as unknown as TextEditRegExpMatchType
          )
          hyperlinks[i].title = "Open in VSCode"
          hyperlinks[i].onclick = handleOnClick(codeLocation)
        }
      }
    }
    logToVscode("Finished handling textedits")
  } catch (err) {
    errorToVscode(`Error handling text edit links: ${err}`)
  }
}

const handleRegisterLinks = async () => {
  try {
    const annotationLayerElems =
      document.getElementsByClassName("annotationLayer")
    for (const annotationsLayerElem of annotationLayerElems) {
      const hyperlinks = annotationsLayerElem.getElementsByTagName("a")
      const registerLink = async (
        codeLocation: LilyPondCodeLocation,
        elementID: string
      ) => {
        const msg: WebviewVSCodeRegisterLinkMessage = {
          type: "register-link",
          codeLocation,
          elementID,
        }
        vscodeAPI.postMessage(msg)
      }

      for (var i = 0; i < hyperlinks.length; i++) {
        const match = textEditRegExp.exec(hyperlinks[i].href)
        if (match) {
          hyperlinks[i].id = hyperlinks[i].href
          const codeLocation = getCodeLocationFromMatchGroups(
            match as unknown as TextEditRegExpMatchType
          )
          registerLink(codeLocation, hyperlinks[i].id)
        }
      }
    }
    logToVscode("Finished registering links")
  } catch (err) {
    errorToVscode(`Error handling register links: ${err}`)
  }
}

const handleGoto = async (elementID: string) => {
  try {
    const elem = document.getElementById(elementID)
    if (!elem) {
      throw new Error(`Unable to find element with ID: ${elementID}`)
    }
    const timeoutMS = 3000
    const blinkGotoClassName = `blink-goto`
    elem.scrollIntoView({ block: `center` })
    elem.classList.add(blinkGotoClassName)
    setTimeout(() => {
      elem.classList.remove(blinkGotoClassName)
    }, timeoutMS)
  } catch (err) {
    errorToVscode(`Error handling goto: ${err}`)
  }
}

type PDFJSUserSettings = {
  cursor: number
  scale: string
  scrollMode: number
  spreadMode: number
  rotation: number
  scrollTop: number
  scrollLeft: number
}

/**
 * From config to PDFJS compliant settings
 */
const shimUserSettings = (
  settings: PDFViewerUserSettings
): PDFJSUserSettings => {
  const cursorToolsStringToEnum = (name: string) => {
    if (name === "hand") {
      return 1
    }
    return 0
  }
  const scrollModeStringToEnum = (name: string) => {
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
  const spreadModeStringToEnum = (name: string) => {
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
  return {
    cursor: cursorToolsStringToEnum(settings.cursor),
    scale: settings.scale,
    scrollMode: scrollModeStringToEnum(settings.scrollMode),
    spreadMode: spreadModeStringToEnum(settings.spreadMode),
    rotation: 0, // in degrees
    scrollTop: 0,
    scrollLeft: 0,
  }
}

const applySettings = (settings: PDFJSUserSettings) => {
  // console.log(`Applying settings: ${JSON.stringify(settings)}`)
  PDFViewerApplication.pdfCursorTools.switchTool(settings.cursor)
  PDFViewerApplication.pdfViewer.currentScaleValue = settings.scale
  PDFViewerApplication.pdfViewer.scrollMode = settings.scrollMode
  PDFViewerApplication.pdfViewer.spreadMode = settings.spreadMode
  PDFViewerApplication.pdfViewer.pagesRotation = settings.rotation
  const viewerContainer = document.getElementById("viewerContainer")
  if (viewerContainer) {
    viewerContainer.scrollTop = settings.scrollTop
    viewerContainer.scrollLeft = settings.scrollLeft
  }
}

const handleLoad = async () => {
  const pdfConfig = loadConfig()

  let settings = shimUserSettings(pdfConfig.userSettings)
  let documentReloading = false
  let loadedPages: Set<number> = new Set()

  const listenToSettingsChanges = () => {
    PDFViewerApplication.eventBus.on("updateviewarea", () => {
      const scrollTop =
        document.getElementById("viewerContainer")?.scrollTop ?? 0
      const scrollLeft =
        document.getElementById("viewerContainer")?.scrollLeft ?? 0
      if (!documentReloading) {
        // check for !documentReloading is required because if the PDF changed (e.g. due to recompilation),
        // updateviewarea gets called with reset settings.
        // console.log("updateviewarea")
        settings = {
          ...settings,
          scale: PDFViewerApplication.pdfViewer.currentScaleValue,
          scrollTop,
          scrollLeft,
          cursor: PDFViewerApplication.pdfCursorTools.activeTool,
          scrollMode: PDFViewerApplication.pdfViewer.scrollMode,
          spreadMode: PDFViewerApplication.pdfViewer.spreadMode,
        }
        // console.log(JSON.stringify(settings))
      }
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

  while (true) {
    try {
      await PDFViewerApplication.open(pdfConfig.path)
      break
    } catch (err) {
      logToVscode(`[WARNING]: Open failed, retrying`)
      console.warn(err)
    }
  }
  PDFViewerApplication.initializedPromise
    .then(() => {
      listenToSettingsChanges()
      PDFViewerApplication.eventBus.on("pagesinit", () => {
        logToVscode("pagesinit")
        documentReloading = true
        loadedPages = new Set()
      })
      PDFViewerApplication.eventBus.on(
        "textlayerrendered",
        (e: { pageNumber: number; [key: string]: any }) => {
          if (documentReloading) {
            // just always close the sidebar--it's super annoying to maintain it.
            // https://github.com/lhl2617/VSLilyPond-PDF-preview/issues/22
            PDFViewerApplication.pdfSidebar.close()
            // apply settings
            applySettings(settings)
            // MUST BE AFTER APPLYING SETTINGS
            documentReloading = false
          }
          loadedPages.add(e.pageNumber)
          console.log(`loaded ${e.pageNumber}`)
          const allPagesLoaded =
            loadedPages.size === PDFViewerApplication.pagesCount
          if (allPagesLoaded) {
            logToVscode("allPagesLoaded")
            // This portion is fired every time the pdf is changed AND FULLY loaded successfully.
            // clear the linkRepository -- waits for "link-register-ready" to register links
            vscodeAPI.postMessage({ type: "clear-links" })
            logToVscode("Sent clear-links")
            // handle textedit links
            handleTextEditLinks()
          }
        }
      )
    })
    .catch((err: any) => {
      console.warn(err)
    })
  window.addEventListener("message", (e) => {
    const message: VSCodeWebviewMessage = e.data
    const type = message.type
    // console.log(JSON.stringify(message))
    switch (type) {
      case "reload":
        // this is not sent by vscode, but is a builtin
        logToVscode("reload")
        PDFViewerApplication.open(pdfConfig.path)
        break
      case "goto":
        handleGoto((message as VSCodeWebviewGoToMessage).elementID)
        break
      case "link-register-ready":
        logToVscode("Received link-register-ready")
        handleRegisterLinks()
        break
      default:
        logToVscode(`Ignoring unknown message: ${JSON.stringify(message)}`)
    }
  })
}

window.addEventListener("load", handleLoad, { once: true })

window.onerror = function () {
  const msg = document.createElement("body")
  msg.innerText =
    "An error occurred while loading the file. Please open it again."
  document.body = msg
}
