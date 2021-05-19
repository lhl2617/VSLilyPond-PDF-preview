// =================
// Webview -> VSCode
// =================
type WebviewVSCodeMessage = {
  type: WebviewVSCodeMessageType
  [key: string]: any
}

type WebviewVSCodeMessageType =
  | "textedit"
  | "register-link"
  | "error"
  | "clear-links"
  | "log"

type WebviewVSCodeTextEditMessage = {
  type: "textedit"
  codeLocation: LilyPondCodeLocation
}

type WebviewVSCodeRegisterLinkMessage = {
  type: "register-link"
} & RegisterLinkContents

// Webview on reload will tell VSCode to clear the linkRepository for goto (code -> score)
type WebviewVSCodeClearLinksMessage = {
  type: "clear-links"
}

type WebviewVSCodeErrorMessage = {
  type: "error"
  errorMessage: string
}

type WebviewVSCodeLogMessage = {
  type: "log"
  message: string
}

// =================
// VSCode -> Webview
// =================
type VSCodeWebviewMessage = {
  type: VSCodeWebviewMessageType
  [key: string]: any
}

type VSCodeWebviewMessageType = "reload" | "goto" | "link-register-ready"

type VSCodeWebviewReloadMessage = {
  type: "reload"
}

type VSCodeWebviewGoToMessage = {
  type: "goto"
  elementID: string
}

// Sent by VSCode to webview when VSCode is ready for links (after clearing them via the clear-links message)
type VSCodeWebviewLinkRegisterReadyMessage = {
  type: "link-register-ready"
}

// =============
// Utility types
// =============
type LilyPondCodeLocation = {
  filepath: LilyPondCodeFilePath
} & LilyPondFileCodeLocation

type LilyPondFileCodeLocation = {
  line: number // 1-indexed: need to decrement if use in VSCode
  col: number
}

type LilyPondCodeFilePath = string

type RegisterLinkContents = {
  codeLocation: LilyPondCodeLocation
  elementID: string
}

type PDFViewerConfig = {
  path: string
  userSettings: PDFViewerUserSettings
}

type PDFViewerUserSettings = {
  cursor: string
  scale: string
  scrollMode: string
  spreadMode: string
}
