// =================
// Webview -> VSCode
// =================
export type WebviewVSCodeMessage = Required<{ type: WebviewVSCodeMessageType }>

export type WebviewVSCodeMessageType = "textedit" | "register-link" | "error"

export type WebviewVSCodeTextEditMessage = {
  type: "textedit"
  codeLocation: LilyPondCodeLocation
}

export type WebviewVSCodeRegisterLinkMessage = {
  type: "register-link"
} & RegisterLinkContents

export type WebviewVSCodeErrorMessage = {
  type: "error"
  errorMessage: string
}

// =================
// VSCode -> Webview
// =================
export type VSCodeWebviewMessage = Required<{ type: VSCodeWebviewMessageType }>

export type VSCodeWebviewMessageType = "goto"

export type VSCodeWebviewGoToMessage = {
  type: "goto"
  pdfLocation: PDFLocation
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
  pdfLocation: PDFLocation
}

export type PDFLocation = DOMRect
