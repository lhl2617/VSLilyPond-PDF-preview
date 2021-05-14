import * as vscode from "vscode"
import { extensionID } from "./consts"
import { outputChannelName, outputToChannel } from "./output"
import { WebviewVSCodeMessage, WebviewVSCodeTextEditMessage } from "./types"
import { codeLocationToRange, codeLocationToSelection } from "./utils"

export class WebviewVSCodeMessageHandler {
  constructor() {}

  private _lastActivatedDecorationType:
    | vscode.TextEditorDecorationType
    | undefined

  public handleWebviewVSCodeMessage = async (msg: WebviewVSCodeMessage) => {
    const { type } = msg
    if (type === "textedit") {
      this._handleWebviewVSCodeTextEditMessage(
        msg as WebviewVSCodeTextEditMessage
      )
    }
  }

  private _handleWebviewVSCodeTextEditMessage = async (
    msg: WebviewVSCodeTextEditMessage
  ) => {
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
      const { codeLocation } = msg
      const { filepath } = codeLocation
      const selection = codeLocationToSelection(codeLocation)
      const selectionRange = codeLocationToRange(codeLocation)
      const textEditor = await getTextEditor(filepath)
      textEditor.revealRange(selectionRange)
      textEditor.selection = selection
      if (this._lastActivatedDecorationType) {
        // clear the last one if not cleared
        textEditor.setDecorations(this._lastActivatedDecorationType, [])
      }
      const decorationType = vscode.window.createTextEditorDecorationType({
        backgroundColor: backgroundColor,
      })
      this._lastActivatedDecorationType = decorationType
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
}
