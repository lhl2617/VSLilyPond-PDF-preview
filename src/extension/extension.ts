import * as vscode from "vscode"
import { extensionID } from "./consts"
import { outputToChannel } from "./output"
import { PdfCustomProvider } from "./pdf-provider"

export const activate = (context: vscode.ExtensionContext) => {
  const extensionRoot = vscode.Uri.file(context.extensionPath)
  // Register our custom editor provider
  const provider = new PdfCustomProvider(extensionRoot)
  context.subscriptions.push(
    vscode.window.registerCustomEditorProvider(
      PdfCustomProvider.viewType,
      provider,
      {
        webviewOptions: {
          enableFindWidget: false, // default
          retainContextWhenHidden: true,
        },
      }
    )
  )

  // Register command
  const goToPDFLocationCmd = vscode.commands.registerCommand(
    `${extensionID}.goToPDFLocationFromCursor`,
    async () => {
      try {
        await provider.goToPDFLocationFromCursor()
      } catch (err) {
        vscode.window.showErrorMessage(
          `Unable to go to PDF Location from cursor: ${err}`
        )
        outputToChannel(`[ERROR]: ${err}`)
      }
    }
  )
  context.subscriptions.push(goToPDFLocationCmd)
}

export const deactivate = () => {}
