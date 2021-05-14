export type WebviewVSCodeMessage = Required<{ type: WebviewVSCodeMessageType }>

export type WebviewVSCodeMessageType =
  | "reopen-as-text"
  | "textedit"
  | "register-link"

export type WebviewVSCodeTextEditMessage = {
  type: "textedit"
  codeLocation: CodeLocation
}

export type CodeLocation = {
  filepath: string
  line: number
  colStart: number
  colEnd: number
}

export type WebviewVSCodeRegisterLinkMessage = {
  type: "register-link"
  codeLocation: CodeLocation
  boundingClientRect: DOMRect
}

export type WebviewVSCodeReopenAsTextMessage = {
  type: "reopen-as-text"
}
