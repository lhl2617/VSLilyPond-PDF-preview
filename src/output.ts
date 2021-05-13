import * as vscode from "vscode"

export const outputChannelName = `VSLilyPond: PDF Preview`
const outputChannel = vscode.window.createOutputChannel(outputChannelName)

export const outputToChannel = async (msg: string, show = false) => {
  outputChannel.appendLine(msg)
  if (show) {
    outputChannel.show()
  }
}
