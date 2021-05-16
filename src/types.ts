// =================
// Webview -> VSCode
// =================
export type WebviewVSCodeMessage = Required<{ type: WebviewVSCodeMessageType }>

export type WebviewVSCodeMessageType =
  | "textedit"
  | "register-link"
  | "error"
  | "clear-links"
  | "log"

export type WebviewVSCodeTextEditMessage = {
  type: "textedit"
  codeLocation: LilyPondCodeLocation
}

export type WebviewVSCodeRegisterLinkMessage = {
  type: "register-link"
} & RegisterLinkContents

// Webview on reload will tell VSCode to clear the linkRepository for goto (code -> score)
export type WebviewVSCodeClearLinksMessage = {
  type: "clear-links"
}

export type WebviewVSCodeErrorMessage = {
  type: "error"
  errorMessage: string
}

export type WebviewVSCodeLogMessage = {
  type: "log"
  message: string
}

// =================
// VSCode -> Webview
// =================
export type VSCodeWebviewMessage = Required<{ type: VSCodeWebviewMessageType }>

export type VSCodeWebviewMessageType = "goto" | "link-register-ready"

export type VSCodeWebviewGoToMessage = {
  type: "goto"
  elementID: string
}

// Sent by VSCode to webview when VSCode is ready for links (after clearing them via the clear-links message)
export type VSCodeWebviewLinkRegisterReadyMessage = {
  type: "link-register-ready"
}

// =============
// Utility types
// =============
export type LilyPondCodeLocation = {
  filepath: LilyPondCodeFilePath
} & LilyPondFileCodeLocation

export type LilyPondFileCodeLocation = {
  line: number // 1-indexed: need to decrement if use in VSCode
  colStart: number
  colEnd: number
}

export type LilyPondCodeFilePath = string

export type RegisterLinkContents = {
  codeLocation: LilyPondCodeLocation
  elementID: string
}
