/* eslint import/prefer-default-export: off */
import { URL } from 'url';
import path from 'path';

export const terminal =
  process.platform === 'win32' ? 'powershell.exe' : '/bin/sh';
export const runScript =
  process.platform === 'win32'
    ? 'python -u "C:/Users/Administrador/Desktop/ProjectHMR/Electron-HMR/code/main.py"'
    : '/bin/python3 /home/verdant/Desktop/Github/Electron-HMR/code/main.py';

export function resolveHtmlPath(htmlFileName: string) {
  if (process.env.NODE_ENV === 'development') {
    const port = process.env.PORT || 1212;
    const url = new URL(`http://localhost:${port}`);
    url.pathname = htmlFileName;
    return url.href;
  }
  return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
}
