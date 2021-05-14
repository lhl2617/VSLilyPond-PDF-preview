import { LilyPondCodeLocation } from "./types"
import * as vscode from "vscode"

export const lilyPondCodeLocationToSelection = (
  codeLocation: LilyPondCodeLocation
): vscode.Selection => {
  const { line, colStart, colEnd } = codeLocation
  const lineNum = line - 1
  return new vscode.Selection(
    new vscode.Position(lineNum, colStart),
    new vscode.Position(lineNum, colEnd)
  )
}

export const lilyPondCodeLocationToRange = (
  codeLocation: LilyPondCodeLocation
): vscode.Range => {
  const { line, colStart, colEnd } = codeLocation
  const lineNum = line - 1
  return new vscode.Range(lineNum, colStart, lineNum, colEnd)
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
