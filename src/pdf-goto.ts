import { PDFLocation, WebviewVSCodeRegisterLinkMessage } from "./types"
import * as vscode from "vscode"

type CursorInfo = {
  line: number // 1-indexed (LilyPond)
  col: number
  fsPath: string
}

export class GoToPDELocationHandler {
  constructor(
    private goToHandler: (
      pdfFsPath: string,
      pdfLocation: PDFLocation
    ) => Promise<any>
  ) {}

  private _linkRepository: Record<
    string, // VSCode Uri fsPath
    Record<
      number, // line number
      // This should be a nice ordered set for O(log n) lookups,
      // but in practice a line should not have many symbols, so O(n)
      // should be fine.
      {
        colStart: number
        colEnd: number
        pdfLocation: PDFLocation
        pdfFsPath: string
      }[]
    >
  > = {}

  public handleRegisterLinkMessageForPdf =
    (pdfFsPath: string) => (msg: WebviewVSCodeRegisterLinkMessage) => {
      const { codeLocation, pdfLocation } = msg
      const { filepath, line, colStart, colEnd } = codeLocation
      const uri = vscode.Uri.file(filepath)
      const { fsPath } = uri
      if (!(fsPath in this._linkRepository)) {
        this._linkRepository[fsPath] = {}
      }
      if (!(line in this._linkRepository[fsPath])) {
        this._linkRepository[fsPath][line] = []
      }
      this._linkRepository[fsPath][line].push({
        colStart,
        colEnd,
        pdfLocation,
        pdfFsPath,
      })
      // console.log(
      //   `Registered ${JSON.stringify(msg)} into ${JSON.stringify(
      //     this._linkRepository
      //   )}`
      // )
    }

  private _getCursorInfo = (): CursorInfo => {
    const { activeTextEditor } = vscode.window
    if (!activeTextEditor) {
      throw new Error("No active text editor open.")
    }
    const { selections } = activeTextEditor
    if (selections.length !== 1) {
      throw new Error(
        "No or multiple cursor positions are present--please only place the cursor at one code location."
      )
    }
    const selection = selections[0]
    const { start } = selection
    const line0based = start.line
    const col = start.character
    const line = line0based + 1 // 1-indexed

    const { fsPath } = activeTextEditor.document.uri
    return {
      line,
      col,
      fsPath,
    }
  }

  private _getPDFPathAndLocationFromCursor = (
    cursor: CursorInfo
  ): {
    pdfFsPath: string
    pdfLocation: PDFLocation
  } => {
    const { fsPath, line, col } = cursor
    if (fsPath in this._linkRepository) {
      const fsPathLinkRepo = this._linkRepository[fsPath]
      if (line in fsPathLinkRepo) {
        const lineLinkRepo = fsPathLinkRepo[line]
        // now iterate through and see if col lies in the colStart -- colEnd range
        for (const {
          colStart,
          colEnd,
          pdfLocation,
          pdfFsPath,
        } of lineLinkRepo) {
          if (colStart <= col && col <= colEnd) {
            return {
              pdfFsPath,
              pdfLocation,
            }
          }
        }
      }
    }
    throw new Error("No valid PDF location can be found from the cursor")
  }

  public goToPDFLocationFromCursor = async () => {
    const cursorInfo = this._getCursorInfo()
    const { pdfLocation, pdfFsPath } =
      this._getPDFPathAndLocationFromCursor(cursorInfo)
    await this.goToHandler(pdfFsPath, pdfLocation)
  }
}
