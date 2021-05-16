import { WebviewVSCodeRegisterLinkMessage } from "./types"
import * as vscode from "vscode"
import { outputToChannel } from "./output"

type CursorInfo = {
  line: number // 1-indexed (LilyPond)
  col: number
  fsPath: string
}

export class GoToPDFLocationHandler {
  private _linkRepository: Record<
    string, // VSCode Uri fsPath (LilyPond code)
    Record<
      number, // line number
      // This should be a nice ordered set for O(log n) lookups,
      // but in practice a line should not have many symbols, so O(n)
      // should be fine.
      {
        colStart: number
        colEnd: number
        elementID: string
        pdfFsPath: string
      }[]
    >
  > = {}

  /**
   * When a PDF is reloaded (due to recompilation) it is required to clear the links
   * from a previous compilation, if there exists any
   * @param pdfFsPath
   */
  public clearLinksForPdf = async (pdfFsPath: string) => {
    outputToChannel(`[LOG]: Clearing links for ${pdfFsPath}`)
    for (const codeFsPath in this._linkRepository) {
      for (const lineStr in this._linkRepository[codeFsPath]) {
        // https://github.com/microsoft/TypeScript/issues/32811
        const lineNum = lineStr as unknown as number
        this._linkRepository[codeFsPath][lineNum] = this._linkRepository[
          codeFsPath
        ][lineNum].filter((x) => x.pdfFsPath !== pdfFsPath)
      }
    }
    outputToChannel(`[LOG]: Links cleared for ${pdfFsPath}`)
  }

  public handleRegisterLinkMessageForPdf =
    (pdfFsPath: string) => async (msg: WebviewVSCodeRegisterLinkMessage) => {
      const { codeLocation, elementID } = msg
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
        elementID,
        pdfFsPath,
      })
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

  public getPDFPathAndElementIDFromCursor = async () => {
    const cursorInfo = this._getCursorInfo()
    const { fsPath, line, col } = cursorInfo
    if (fsPath in this._linkRepository) {
      const fsPathLinkRepo = this._linkRepository[fsPath]
      if (line in fsPathLinkRepo) {
        const lineLinkRepo = fsPathLinkRepo[line]
        /*
        // now iterate through and see if col lies in the colStart -- colEnd range
        for (const { colStart, colEnd, elementID, pdfFsPath } of lineLinkRepo) {
          if (colStart <= col && col <= colEnd) {
            return {
              pdfFsPath,
              elementID,
            }
          }
        }
        */
        // The below block is problematic because colEnd is always col + 1
        // In fact I think it's not significant--thus, just find the first element with col >= colStart
        for (const { colStart, elementID, pdfFsPath } of lineLinkRepo) {
          if (col >= colStart) {
            return {
              pdfFsPath,
              elementID,
            }
          }
        }
      }
    }
    throw new Error("No valid PDF location can be found from the cursor")
  }
}
