import * as monaco from 'monaco-editor'

import githubLight from './themes/github-light.json'
import githubDark from './themes/github-dark.json'

/** Custom theme names registered with Monaco */
export const GITHUB_LIGHT = 'github-light'
export const GITHUB_DARK = 'github-dark'

let registered = false

/** Register GitHub themes with Monaco. Safe to call multiple times. */
export function registerGitHubThemes(): void {
  if (registered) return
  registered = true

  monaco.editor.defineTheme(
    GITHUB_LIGHT,
    githubLight as unknown as monaco.editor.IStandaloneThemeData,
  )
  monaco.editor.defineTheme(
    GITHUB_DARK,
    githubDark as unknown as monaco.editor.IStandaloneThemeData,
  )
}
