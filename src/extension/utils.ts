import * as vscode from "vscode"
import { outputToChannel } from "./output"

export const lilyPondCodeLocationToWordRange = (
  codeLocation: LilyPondCodeLocation,
  textDocument: vscode.TextDocument
): vscode.Range => {
  const { line, col } = codeLocation
  const lineNum = line - 1
  const position = new vscode.Position(lineNum, col)
  const range = textDocument.getWordRangeAtPosition(position, /[^\s-]+/)
  if (!range) {
    outputToChannel(
      `[WARNING]: Can't get word range at position ${JSON.stringify(
        position
      )}, falling back to col + 1`
    )
    return new vscode.Range(position, new vscode.Position(lineNum, col + 1))
  }
  // force it to start at col
  const rangeEnd = range.end
  if (position.isAfterOrEqual(rangeEnd)) {
    // fall back
    return new vscode.Range(position, new vscode.Position(lineNum, col + 1))
  }
  return new vscode.Range(position, range.end)
}

/**
 * Get the text editor pointed to by `filepath`.
 * First tries to find in the visible documents before trying
 * to open one.
 */
export const getTextEditorFromFilePathWithVisiblePriority = async (
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
