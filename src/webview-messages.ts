import * as vscode from "vscode"
import { extensionID } from "./consts"
import { outputChannelName, outputToChannel } from "./output"
import { WebviewMessage, WebviewTextEditMessage } from "./types"

export const handleWebviewMessage = (msg: WebviewMessage) => {
  const { command } = msg
  if (command === "textedit") {
    handleWebviewTextEditMessage(msg as WebviewTextEditMessage)
  }
}

let lastActivatedDecorationType: vscode.TextEditorDecorationType | undefined

const handleWebviewTextEditMessage = async (msg: WebviewTextEditMessage) => {
  /**
   * Get the text editor pointed to by `filepath`.
   * First tries to find in the visible documents before trying
   * to open one.
   */
  const getTextEditor = async (
    filepath: string
  ): Promise<vscode.TextEditor> => {
    const uri = vscode.Uri.file(filepath)
    for (const textEditor of vscode.window.visibleTextEditors) {
      if (textEditor.document.uri.fsPath === uri.fsPath) {
        return textEditor
      }
    }
    return await vscode.window.showTextDocument(uri)
  }

  try {
    const config = vscode.workspace.getConfiguration(extensionID)
    const backgroundColor = config.get(
      "pointAndClick.backgroundColor"
    ) as string
    const highlightDuration = config.get(
      "pointAndClick.highlightDuration"
    ) as number
    const { filepath, line, colStart, colEnd } = msg
    const lineNum = line - 1 // 1-indexed
    const selection = new vscode.Selection(
      new vscode.Position(lineNum, colStart),
      new vscode.Position(lineNum, colEnd)
    )
    const selectionRange = new vscode.Range(lineNum, colStart, lineNum, colEnd)
    const textEditor = await getTextEditor(filepath)
    textEditor.revealRange(selectionRange)
    textEditor.selection = selection
    if (lastActivatedDecorationType) {
      // clear the last one if not cleared
      textEditor.setDecorations(lastActivatedDecorationType, [])
    }
    const decorationType = vscode.window.createTextEditorDecorationType({
      backgroundColor: backgroundColor,
    })
    lastActivatedDecorationType = decorationType
    textEditor.setDecorations(decorationType, [selectionRange])
    setTimeout(
      () => textEditor.setDecorations(decorationType, []),
      highlightDuration
    )
  } catch (err) {
    vscode.window.showErrorMessage(
      `Point-and-click failed, see "${outputChannelName}" Output for more info.`
    )
    outputToChannel(`[ERROR]: ${err}`, true)
  }
}
