import childProcess from 'child_process';
import { terminal } from './util';

export function increaseVolume() {
  let volume = 0.0;
  childProcess
    .spawn('powershell.exe', [
      'C:/Users/Administrador/Desktop/ProjectHMR/Electron-HMR/code/volume.ps1 ; [Audio]::Volume',
    ])
    .stdout.addListener('data', (buffer) => {
      if (buffer.toString()) {
        volume = buffer.toString();
      }
    });
  childProcess
    .spawn('powershell.exe', [
      `C:/Users/Administrador/Desktop/ProjectHMR/Electron-HMR/code/volume.ps1 ; [Audio]::Volume = ${
        volume + 0.9
      }`,
    ])
    .stdout.addListener('data', (buffer) => {
      console.log(buffer.toString());
      if (buffer.toString()) {
        volume = buffer.toString();
      }
    });
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
