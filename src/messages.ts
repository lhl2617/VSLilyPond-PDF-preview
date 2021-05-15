import * as vscode from "vscode"
import { extensionID } from "./consts"
import { outputChannelName, outputToChannel } from "./output"
import {
  VSCodeWebviewMessage,
  WebviewVSCodeErrorMessage,
  WebviewVSCodeMessage,
  WebviewVSCodeMessageType,
  WebviewVSCodeRegisterLinkMessage,
  WebviewVSCodeTextEditMessage,
} from "./types"
import {
  lilyPondCodeLocationToRange,
  lilyPondCodeLocationToSelection,
  getTextEditorFromFilePathWithVisiblePriority,
} from "./utils"

export class WebviewVSCodeMessageHandler {
  private readonly _textEditMessageHandler = new TextEditMessageHandler()
  private readonly _errorMessageHandler = new ErrorMessageHandler()
  private readonly _registerLinkMessageHandler: RegisterLinkMessageHandler

  constructor(
    _handleRegisterLinkMessage: (msg: WebviewVSCodeRegisterLinkMessage) => any
  ) {
    this._registerLinkMessageHandler = new RegisterLinkMessageHandler(
      _handleRegisterLinkMessage
    )
  }

  public handleWebviewVSCodeMessage = async (msg: WebviewVSCodeMessage) => {
    const { type } = msg
    switch (type) {
      case "textedit":
        this._textEditMessageHandler.handle(msg as WebviewVSCodeTextEditMessage)
        break
      case "register-link":
        this._registerLinkMessageHandler.handle(
          msg as WebviewVSCodeRegisterLinkMessage
        )
        break
      case "error":
        this._errorMessageHandler.handle(msg as WebviewVSCodeErrorMessage)
      default:
        vscode.window.showErrorMessage(
          `Something went wrong, see "${outputChannelName}" Output for more info.`
        )
        outputToChannel(
          `[ERROR]: Unknown WebviewVSCodeMessage type ${type} for message ${msg}`,
          true
        )
    }
  }
}

class RegisterLinkMessageHandler {
  constructor(public handle: (msg: WebviewVSCodeRegisterLinkMessage) => any) {}
}

class ErrorMessageHandler {
  public handle = async (msg: WebviewVSCodeErrorMessage) => {
    vscode.window.showErrorMessage(
      `Something went wrong, see "${outputChannelName}" Output for more info.`
    )
    outputToChannel(`[ERROR]: ${msg}`, true)
  }
}

class TextEditMessageHandler {
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
      const selection = lilyPondCodeLocationToSelection(codeLocation)
      const selectionRange = lilyPondCodeLocationToRange(codeLocation)
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
