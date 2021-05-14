import * as vscode from "vscode"
import { extensionID } from "../consts"
import { outputChannelName, outputToChannel } from "../output"
import { WebviewVSCodeMessage, WebviewVSCodeTextEditMessage } from "../types"
import {
  codeLocationToRange,
  codeLocationToSelection,
  getTextEditorFromFilePathWithVisiblePriority,
} from "../utils"

export class WebviewVSCodeMessageHandler {
  private readonly _textEditMessageHandler =
    new WebviewVSCodeTextEditMessageHandler()
  constructor() {}

  public handleWebviewVSCodeMessage = async (msg: WebviewVSCodeMessage) => {
    const { type } = msg
    if (type === "textedit") {
      this._textEditMessageHandler.handle(msg as WebviewVSCodeTextEditMessage)
    } else {
      console.error(
        `Unknown WebviewVSCodeMessage type ${type} for message ${msg}`
      )
    }
  }
}

class WebviewVSCodeTextEditMessageHandler {
  constructor() {}

  private _lastActivatedDecorationType:
    | vscode.TextEditorDecorationType
    | undefined

  public handle = async (msg: WebviewVSCodeTextEditMessage) => {
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
      const textEditor = await getTextEditorFromFilePathWithVisiblePriority(
        filepath
      )
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
