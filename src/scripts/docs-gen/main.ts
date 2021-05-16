// RUN FROM ROOT DIRECTORY
// Generates SETTINGS.md
// `npm run docs:gen`

import * as fs from "fs"

const packageJSON = fs.readFileSync(`./package.json`, "utf-8").toString()
const packageObject = JSON.parse(packageJSON)

// ===========
// SETTINGS.md
// ===========
type Setting = {
  type: string
  title: string
  default: string
  group: string
  markdownDescription: string
}

type UntitledSetting = {
  type: string
  default: string
  group: string
  markdownDescription: string
}

const settings: Record<string, UntitledSetting> =
  packageObject.contributes.configuration.properties

const groupedSettings: Record<string, Setting[]> = {}

Object.entries(settings).forEach(([settingTitle, setting]) => {
  if (!(setting.group in groupedSettings)) {
    groupedSettings[setting.group] = []
  }
  groupedSettings[setting.group].push({ ...setting, title: settingTitle })
})

// generate SETTINGS.md
let settingFileContent = [
  `# VSLilyPond Settings`,
  `### Can be accessed via \`Settings (JSON)\` or \`Settings (UI)\``,
]

Object.entries(groupedSettings).forEach(([groupName, settings]) => {
  settingFileContent.push(`## ${groupName}`)

  settings.forEach((setting) => {
    settingFileContent = settingFileContent.concat([
      `### ${setting.title}`,
      setting.markdownDescription,
      `Type: \`${setting.type}\``,
      `Default value: ${
        setting.default.toString().length
          ? `\`${setting.default.toString()}\``
          : `N/A`
      }`,
    ])
  })
})

fs.writeFileSync(`./docs/SETTINGS.md`, settingFileContent.join(`\n\n`))

// ===========
// COMMANDS.md
// ===========
type Command = {
  command: string
  title: string
  group: string
  description: string
}

const commands: Command[] = packageObject.contributes.commands

const groupedCommands: Record<string, Command[]> = {}

commands.forEach((command: Command) => {
  if (!(command.group in groupedCommands)) {
    groupedCommands[command.group] = []
  }
  groupedCommands[command.group].push(command)
})

// generate COMMANDS.md
let commandFileContent = [
  `# VSLilyPond Commands`,
  `### Can be accessed via the Command Palette (Windows: \`Ctrl+Shift+P\`, Mac: \`Cmd+Shift+P\`)`,
]

Object.entries(groupedCommands).forEach(([groupName, commands]) => {
  commandFileContent.push(`## ${groupName}`)
  commands.forEach((command) => {
    commandFileContent = commandFileContent.concat([
      `### ${command.title}`,
      command.description,
    ])
  })
})

fs.writeFileSync(`./docs/COMMANDS.md`, commandFileContent.join(`\n\n`))
