import { window } from 'vscode'

export async function activate() {
  window.showInformationMessage('Hi')
}

export function deactivate() {}
