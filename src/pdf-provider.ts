import * as vscode from "vscode"
import { GoToPDFLocationHandler } from "./pdf-goto"
import { PdfPreview } from "./pdf-preview"
import {
  PDFLocation,
  VSCodeWebviewGoToMessage,
  VSCodeWebviewLinkRegisterReadyMessage,
  WebviewVSCodeClearLinksMessage,
} from "./types"

export class PdfCustomProvider implements vscode.CustomReadonlyEditorProvider {
  public static readonly viewType = "lilypond.pdf.preview"

  private readonly _previews = new Set<PdfPreview>()
  private _activePreview: PdfPreview | undefined
  private _goToPDFLocationHandler = new GoToPDFLocationHandler()

  constructor(private readonly extensionRoot: vscode.Uri) {}

  public openCustomDocument(uri: vscode.Uri): vscode.CustomDocument {
    return { uri, dispose: (): void => {} }
  }

  public async resolveCustomEditor(
    document: vscode.CustomDocument,
    webviewEditor: vscode.WebviewPanel
  ): Promise<void> {
    const registerLinkMessageHandler =
      this._goToPDFLocationHandler.handleRegisterLinkMessageForPdf(
        document.uri.fsPath
      )
    const clearLinksMessageHandler = async (
      _msg: WebviewVSCodeClearLinksMessage
    ) => {
      await this._goToPDFLocationHandler.clearLinksForPdf(document.uri.fsPath)
      const msg: VSCodeWebviewLinkRegisterReadyMessage = {
        type: "link-register-ready",
      }
      preview.postMessageToWebview(msg)
    }

    const preview = new PdfPreview(
      this.extensionRoot,
      document.uri,
      webviewEditor,
      registerLinkMessageHandler,
      clearLinksMessageHandler
    )
    this._previews.add(preview)
    this.setActivePreview(preview)

    webviewEditor.onDidDispose(() => {
      this._previews.delete(preview)
    })

    webviewEditor.onDidChangeViewState(() => {
      if (webviewEditor.active) {
        this.setActivePreview(preview)
      } else if (this._activePreview === preview && !webviewEditor.active) {
        this.setActivePreview(undefined)
      }
    })
  }

  public get activePreview(): PdfPreview | undefined {
    return this._activePreview
  }

  private setActivePreview(value: PdfPreview | undefined): void {
    this._activePreview = value
  }

  private async goToPDFLocation(pdfFsPath: string, pdfLocation: PDFLocation) {
    // find the preview with the right pdfFsPath
    let preview: PdfPreview | undefined
    for (const p of this._previews.values()) {
      if (p.fsPath === pdfFsPath) {
        preview = p
        break
      }
    }
    if (preview === undefined) {
      throw new Error(`Please open the PDF file (${pdfFsPath})`)
    }
    const msg: VSCodeWebviewGoToMessage = {
      type: "goto",
      pdfLocation: pdfLocation,
    }
    preview.postMessageToWebview(msg)
    preview.revealWebview()
  }

  public async goToPDFLocationFromCursor() {
    const { pdfLocation, pdfFsPath } =
      await this._goToPDFLocationHandler.getPDFPathAndLocationFromCursor()
    await this.goToPDFLocation(pdfFsPath, pdfLocation)
  }
}
