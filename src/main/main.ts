/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */

import path from 'path';
import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import childProcess from 'child_process';
import Store from 'electron-store';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import { openNewBrowserTab } from './scripts';

const store = new Store();

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 840,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      nodeIntegration: true,
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.on('set-user-settings', (event, arg) => {
  store.set('userSettings', arg);
});

// Mudar isso aqui, é apenas para abrir a camera e nao abrir o HMR
ipcMain.on('open-camera', async () => {
  const process = {
    terminal: childProcess.spawn('/bin/sh'),
    handler: console.log,
    send: (data: any) => {
      process.terminal.stdin.write(`${data}\n`);
    },
  };
  // Handle Data
  process.terminal.stdout.on('data', (buffer) => {
    process.handler({ type: 'data', data: buffer });
  });
  process.handler = (output) => {
    let data = '';
    if (output.data) data += `: ${output.data.toString()}`;
    console.log(output.type + data);
    process.send(
      '/bin/python3 /home/verdant/Desktop/Github/Electron-HMR/code/main.py'
    );
  };
  process.send(
    '/bin/python3 /home/verdant/Desktop/Github/Electron-HMR/code/main.py'
  );

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) createWindow();
  });
});
function executeTask(data: string) {
  const [symbol, dir] = data.split(' ');
  switch (symbol) {
    case 'A':
      switch (dir.replace(/(\r\n|\n|\r)/gm, '')) {
        case 'esquerda':
          openNewBrowserTab();
          break;
        case 'direita':
          console.log('A direita');
          break;
        case 'cima':
          console.log('A cima');
          break;
        case 'baixo':
          console.log('A baixo');
          break;
        default:
          console.log('Default do A');
          break;
      }
      break;
    default: {
      console.log('Default do B');
    }
  }
}

ipcMain.on('start-program', () => {
  // const settings = store.get('userSettings');
  const settings = [
    { symbol: '1 Up', option: 'Open a new tab in your browser' },
    { symbol: '1 Down', option: 'Increase the PC sound' },
    { symbol: '1 Left', option: 'Decrease the PC sound' },
    { symbol: '1 Right', option: 'Open Visual Studio Code' },
  ];
  mainWindow?.hide();
  if (settings) {
    const process = {
      terminal: childProcess.spawn('/bin/sh'),
      handler: console.log,
      send: (data: any) => {
        process.terminal.stdin.write(`${data}\n`);
      },
    };
    process.terminal.stdout.on('data', (buffer) => {
      process.handler({ type: 'data', data: buffer });
    });
    process.handler = (output) => {
      executeTask(output.data.toString());
      process.send(
        '/bin/python3 /home/verdant/Desktop/Github/Electron-HMR/code/main.py'
      );
    };
    process.send(
      '/bin/python3 /home/verdant/Desktop/Github/Electron-HMR/code/main.py'
    );
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
  })
  .catch(console.log);
