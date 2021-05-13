export type WebviewMessage = Required<{ command: WebviewCommand }>

export type WebviewCommand = "textedit"

export type WebviewTextEditMessage = {
  command: "textedit"
  filepath: string
  line: number
  colStart: number
  colEnd: number
}
