import { CodeLocation } from "./types"
import * as vscode from "vscode"

export const codeLocationToSelection = (
  codeLocation: CodeLocation
): vscode.Selection => {
  const { line, colStart, colEnd } = codeLocation
  const lineNum = line - 1 // 1-indexed
  return new vscode.Selection(
    new vscode.Position(lineNum, colStart),
    new vscode.Position(lineNum, colEnd)
  )
}

export const codeLocationToRange = (
  codeLocation: CodeLocation
): vscode.Range => {
  const { line, colStart, colEnd } = codeLocation
  const lineNum = line - 1 // 1-indexed
  return new vscode.Range(lineNum, colStart, lineNum, colEnd)
}
