// =================
// Webview -> VSCode
// =================
export type WebviewVSCodeMessage = Required<{ type: WebviewVSCodeMessageType }>

export type WebviewVSCodeMessageType = "textedit" | "register-link"

export type WebviewVSCodeTextEditMessage = {
  type: "textedit"
  codeLocation: CodeLocation
}

export type WebviewVSCodeRegisterLinkMessage = {
  type: "register-link"
  codeLocation: CodeLocation
  boundingClientRect: DOMRect
}

// =================
// VSCode -> Webview
// =================
export type VSCodeWebviewMessage = Required<{ type: WebviewVSCodeMessageType }>

export type VSCodeWebviewMessageType = "goto"

export type VSCodeWebviewGotoMessage = {
  type: "goto"
  boundingClientRect: DOMRect
}

// =============
// Utility types
// =============
export type CodeLocation = {
  filepath: string
  line: number
  colStart: number
  colEnd: number
}
