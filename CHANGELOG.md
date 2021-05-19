# Change Log

## 0.2.4
- Fix [#37](https://github.com/lhl2617/VSLilyPond-PDF-preview/issues/37)
  - Place cursor at beginning of backward point-and-click selection
- Select whole word whenever possible

## 0.2.3
- Fix [#35](https://github.com/lhl2617/VSLilyPond-PDF-preview/issues/35)
  - Focus code with point on click even with already visible text editor

## 0.2.2
- Hack to fix [#28](https://github.com/lhl2617/VSLilyPond-PDF-preview/issues/28)
  - Load the whole PDF forcefully

## 0.2.1
- Update dependencies
- Fix issue #27: PDF Preview fails silently sometimes upon startup
  - Naively retry to open in fail-prone area

## 0.2.0
- Implement issue #7: Goto from source code to PDF
- Code refactors

## 0.1.11
- Make sure patches to pdf.js are made during compilation and publishing

## 0.1.10
- Fix issue (#17): Use `pdf-js-viewer-min` instead of downloading pdf.js separately

## 0.1.9
- Fix issues #19, #20, #21, #22
  - Killed sidebar on load entirely: it is very annoying
  - Persist settings across PDF compilations:
    - cursor
    - scale
    - scrollMode
    - spreadMode
    - rotation
    - scrollTop
    - scrollLeft

## 0.1.8
- Fix issue (#15) where this extension causes VSLilyPond to be unable to start in a devcontainer
  - Removed `extensionKind` to let this extension start in the workspace.

## 0.1.7
- Fix issue (#11) where options are not applied when the PDF is reloaded
- Fix Configuration name (s/PDF Preview/LilyPond PDF Preview)

## 0.1.6
- Activate extension upon opening a `lilypond` language file

## 0.1.5
- Add "workspace" to `extensionKind` (allowing the extension to run in remote environments).

## 0.1.4
- Update docs

## 0.1.3
- Update docs

## 0.1.2
- Update docs

## 0.1.1
- Cleanup
- Update dependencies

## 0.1.0

- Initial release