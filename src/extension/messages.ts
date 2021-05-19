import * as vscode from "vscode"
import { extensionID } from "./consts"
import { outputChannelName, outputToChannel } from "./output"
import {
  getTextEditorFromFilePathWithVisiblePriority,
  lilyPondCodeLocationToWordRange,
} from "./utils"

export class WebviewVSCodeMessageHandler {
  private readonly _textEditMessageHandler = new TextEditMessageHandler()
  private readonly _errorMessageHandler = new ErrorMessageHandler()
  private readonly _logMessageHandler = new LogMessageHandler()
  private readonly _registerLinkMessageHandler: RegisterLinkMessageHandler
  private readonly _clearLinksHandler: ClearLinksHandler

  constructor(
    _handleRegisterLinkMessage: (msg: WebviewVSCodeRegisterLinkMessage) => any,
    _handleClearLinks: (msg: WebviewVSCodeClearLinksMessage) => any
  ) {
    this._registerLinkMessageHandler = new RegisterLinkMessageHandler(
      _handleRegisterLinkMessage
    )
    this._clearLinksHandler = new ClearLinksHandler(_handleClearLinks)
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
        break
      case "clear-links":
        this._clearLinksHandler.handle(msg as WebviewVSCodeClearLinksMessage)
        break
      case "log":
        this._logMessageHandler.handle(msg as WebviewVSCodeLogMessage)
        break
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
    outputToChannel(`[ERROR]: [WEBVIEW]: ${msg.errorMessage}`, true)
  }
}

class LogMessageHandler {
  public handle = async (msg: WebviewVSCodeLogMessage) => {
    outputToChannel(`[LOG]: [WEBVIEW]: ${msg.message}`)
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
      const textEditor = await getTextEditorFromFilePathWithVisiblePriority(
        filepath
      )
      const selectionRange = lilyPondCodeLocationToWordRange(
        codeLocation,
        textEditor.document
      )
      const selection = new vscode.Selection(
        selectionRange.start,
        selectionRange.start
      )

      textEditor.revealRange(selectionRange)
      // give the editor focus
      vscode.window.showTextDocument(
        textEditor.document,
        textEditor.viewColumn,
        false
      )
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

class ClearLinksHandler {
  constructor(public handle: (msg: WebviewVSCodeClearLinksMessage) => any) {}
}
