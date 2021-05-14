export type WebviewVSCodeMessage = Required<{ type: WebviewVSCodeMessageType }>

export type WebviewVSCodeMessageType = "textedit" // | "register-link"

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

// export type WebviewVSCodeRegisterLinkMessage = {
//   type: "register-link"
//   codeLocation: CodeLocation
//   boundingClientRect: DOMRect
// }
