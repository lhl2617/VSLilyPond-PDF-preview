# Change Log

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