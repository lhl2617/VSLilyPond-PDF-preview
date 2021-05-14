export type WebviewVSCodeMessage = Required<{ command: WebviewVSCodeCommand }>

export type WebviewVSCodeCommand = "textedit"

export type WebviewVSCodeTextEditMessage = {
  command: "textedit"
  filepath: string
  line: number
  colStart: number
  colEnd: number
}
