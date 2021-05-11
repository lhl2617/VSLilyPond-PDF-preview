#!/usr/bin/env bash

set -e

# Ensure we're in the root
cd "$(dirname "$0")" && cd ..

# Following tomoki1207/vscode-pdfviewer
pdfjs_version=2.4.456

pdfjs_path=pdfjs
pdfjs_zip_path=$pdfjs_path.zip

rm -rf $pdfjs_zip_path
rm -rf $pdfjs_path

# https://mozilla.github.io/pdf.js/getting_started/#download
url=https://github.com/mozilla/pdf.js/releases/download/v$pdfjs_version/pdfjs-$pdfjs_version-dist.zip

echo "=== Downloading pdfjs version $pdfjs_version from $url ==="
wget $url -O $pdfjs_zip_path
echo "=== Download succeeded ==="

echo "=== Unzipping to $pdfjs_path ==="
mkdir $pdfjs_path
unzip $pdfjs_zip_path -d $pdfjs_path
echo "=== Successfully unzipped to $pdfjs_path ==="

# Remove the default PDF from pdfjs/web/viewer.js
viewer_js_path=$pdfjs_path/web/viewer.js
echo "=== Removing default PDF preview from $viewer_js_path ==="
sed -i 's/compressed.tracemonkey-pldi-09.pdf//g' $viewer_js_path
echo "=== Successfully removed default PDF preview from $viewer_js_path ==="

echo "=== Removing downloaded zip file $pdfjs_zip_path ==="
rm -rf $pdfjs_zip_path

echo "=== DONE ==="
