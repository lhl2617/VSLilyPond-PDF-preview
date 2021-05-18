// RUN FROM ROOT DIRECTORY
// Patches pdfjs-dist-viewer-min files with required changes
// `npm run pdfjs:patch`

import * as path from "path"
import replace from "replace-in-file"
import * as fs from "fs"
import { exit } from "process"

const pdfjsPath = path.join(
  "node_modules",
  "pdfjs-dist-viewer-min",
  "build",
  "minified"
)

// If this file exists, it means this step is done
const pdfjsPatchedPath = path.join(pdfjsPath, "patched.txt")
if (fs.existsSync(pdfjsPatchedPath)) {
  console.log(`=== Already patched (${pdfjsPatchedPath} found) ===`)
  console.log(`=== DONE ===`)
  exit(0)
}

// Remove the reference to the default PDF
const pdfViewerJsPath = path.join(pdfjsPath, "web", "pdf.viewer.js")
fs.copyFileSync(pdfViewerJsPath, `${pdfViewerJsPath}.original`)
console.log(`=== Removing default PDF preview from ${pdfViewerJsPath} ===`)
replace.sync({
  files: pdfViewerJsPath,
  from: "compressed.tracemonkey-pldi-09.pdf",
  to: "",
})
console.log(
  `=== Successfully removed default PDF preview from ${pdfViewerJsPath} ===`
)

// render everything, disregarding mozilla's warnings--this is to make point-and-click work.
// Takes a lot of memory...
// TODO:- wrestle with this!
console.log(
  `=== Patch to force rendering of all pages in ${pdfViewerJsPath} ===`
)
replace.sync({
  files: pdfViewerJsPath,
  from: "const s=e.scrollTop,r=s+e.clientHeight,l=e.scrollLeft,h=l+e.clientWidth;",
  to: "const s=0,r=e.scrollHeight,l=0,h=e.scrollWidth;",
})
console.log(
  `=== Successfully patched rendering of all pages i ${pdfViewerJsPath} ===`
)

// Make textedit: a valid protocol in _isValidProtocol for pdf.js and pdf.worker.js
const pdfjsPdfjsPath = path.join(pdfjsPath, "build", "pdf.js")
fs.copyFileSync(pdfjsPdfjsPath, `${pdfjsPdfjsPath}.original`)
const pdfjsPdfjsWorkerPath = path.join(pdfjsPath, "build", "pdf.worker.js")
fs.copyFileSync(pdfjsPdfjsWorkerPath, `${pdfjsPdfjsWorkerPath}.original`)
console.log(
  `=== Adding textedit: as a valid protocol in ${pdfjsPdfjsPath} and ${pdfjsPdfjsWorkerPath} ===`
)
replace.sync({
  files: [pdfjsPdfjsPath, pdfjsPdfjsWorkerPath],
  from: `case"tel:":`,
  to: `case"tel:":case"textedit:":`,
})
console.log(
  `=== Successfully added textedit: as a valid protocol in ${pdfjsPdfjsPath} and ${pdfjsPdfjsWorkerPath} ===`
)

// Write a file denoting patched status
console.log(`=== Creating patched indication file ${pdfjsPatchedPath} ===`)
fs.closeSync(fs.openSync(pdfjsPatchedPath, "w"))
console.log(
  `=== Successfully created patched indication file ${pdfjsPatchedPath} ===`
)

console.log("=== DONE ===")
