// RUN FROM ROOT DIRECTORY
// Patches pdfjs-dist-viewer-min files with required changes
// `npm run pdfjs:patch`

import * as path from "path"
const pdfjsPath = path.join("node_modules", "pdfjs-dist-viewer-min")

console.log("=== Removing default PDF preview from $viewer_js_path ===")
