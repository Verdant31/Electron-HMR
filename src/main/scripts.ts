import childProcess from 'child_process';
import Store from 'electron-store';
import { terminal } from './util';

const store = new Store();

export function toggleVolume(isSome: boolean) {
  if (process.platform === 'win32') {
    let volume = 0.0;
    const child = childProcess.spawn('powershell.exe', [
      'C:/Users/Administrador/Desktop/ProjectHMR/Electron-HMR/code/volume.ps1 ; [Audio]::Volume',
    ]);

    child.stdout.addListener('data', (buffer) => {
      if (buffer.toString()) {
        volume = buffer
          .toString()
          .replace(/(\r\n|\n|\r)/gm, '')
          .replace(',', '.');
        const newVolume = isSome
          ? parseFloat(volume.toString()) + 0.3
          : parseFloat(volume.toString()) - 0.3;
        childProcess.spawn('powershell.exe', [
          `C:/Users/Administrador/Desktop/ProjectHMR/Electron-HMR/code/volume.ps1 ; [Audio]::Volume = ${newVolume}`,
        ]);
      }
    });
  } else {
    // TODO Fazer o aumento e diminuição de volume funcional no linux também
  }
}

export function openCode() {
  const path = store.get('vscode-project-path');
  childProcess.spawn(terminal, [`code ${path}`]);
}

export function openNewBrowserTab() {
  const inter = {
    terminal: childProcess.spawn(terminal),
    handler: console.log,
    send: (data: any) => {
      inter.terminal.stdin.write(`${data}`);
    },
  };

  inter.terminal.stdout.on('data', (buffer) => {
    inter.handler({ type: 'data', data: buffer });
  });

  if (process.platform === 'win32') {
    inter.send('start chrome "https://www.google.com/"');
  } else {
    inter.send('google-chrome --app-url https://www.google.com/');
  }
}
