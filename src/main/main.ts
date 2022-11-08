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
import { app, BrowserWindow, shell, ipcMain, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import childProcess from 'child_process';
import Store from 'electron-store';
import MenuBuilder from './menu';
import { openCameraScript, resolveHtmlPath, runScript, terminal } from './util';
import { openCode, openNewBrowserTab, toggleVolume } from './scripts';

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

ipcMain.on('select-dir', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory'],
  });
  const formattedPath = result.filePaths[0].replace(/\\/g, '/');
  store.set('vscode-project-path', formattedPath);
  (mainWindow as BrowserWindow).webContents.send(
    'get-path',
    store.get('vscode-project-path')
  );
  console.log(formattedPath);
});

ipcMain.on('open-camera', async () => {
  const inter = {
    terminal: childProcess.spawn(terminal),
    handler: console.log,
    send: (data: any) => {
      inter.terminal.stdin.write(`${data}\n`);
    },
  };
  // Handle Data
  inter.terminal.stdout.on('data', (buffer) => {
    inter.handler({ type: 'data', data: buffer });
  });
  inter.handler = () => {
    inter.send(openCameraScript);
  };
  inter.send(openCameraScript);

  app.on('activate', () => {
    if (mainWindow === null) createWindow();
  });
});

function executeTask(data: string, settings: any) {
  const [symbol, dir] = data.split(' ');
  const command = `${symbol} ${dir.replace(/(\r\n|\n|\r)/gm, '')}`;
  let userOption = '';
  settings.forEach((setting: any) => {
    if (setting.symbol === command) {
      userOption = setting.option;
    }
  });
  switch (symbol) {
    case 'A':
      switch (dir.replace(/(\r\n|\n|\r)/gm, '')) {
        case 'esquerda':
          switch (userOption) {
            case 'Open a new tab in your browser':
              openNewBrowserTab();
              break;
            case 'Increase the PC sound':
              toggleVolume(true);
              break;
            case 'Decrease the PC sound':
              toggleVolume(false);
              break;
            case 'Open Visual Studio Code':
              openCode();
              break;
            default:
              break;
          }
          break;
        case 'direita':
          switch (userOption) {
            case 'Open a new tab in your browser':
              openNewBrowserTab();
              break;
            case 'Increase the PC sound':
              toggleVolume(true);
              break;
            case 'Decrease the PC sound':
              toggleVolume(false);
              break;
            case 'Open Visual Studio Code':
              openCode();
              break;
            default:
              break;
          }
          break;
        case 'cima':
          switch (userOption) {
            case 'Open a new tab in your browser':
              openNewBrowserTab();
              break;
            case 'Increase the PC sound':
              toggleVolume(true);
              break;
            case 'Decrease the PC sound':
              toggleVolume(false);
              break;
            case 'Open Visual Studio Code':
              openCode();
              break;
            default:
              break;
          }
          break;
        case 'baixo':
          switch (userOption) {
            case 'Open a new tab in your browser':
              openNewBrowserTab();
              break;
            case 'Increase the PC sound':
              toggleVolume(true);
              break;
            case 'Decrease the PC sound':
              toggleVolume(false);
              break;
            case 'Open Visual Studio Code':
              openCode();
              break;
            default:
              break;
          }
          break;
        default:
          break;
      }
      break;
    default: {
      break;
    }
  }
}

ipcMain.on('start-program', () => {
  const settings = store.get('userSettings');

  mainWindow?.hide();
  if (settings) {
    const inter = {
      terminal: childProcess.spawn(terminal),
      handler: console.log,
      send: (data: any) => {
        inter.terminal.stdin.write(`${data}\n`);
      },
    };
    inter.terminal.stdout.on('data', (buffer) => {
      inter.handler({ type: 'data', data: buffer });
    });
    inter.handler = (output) => {
      executeTask(output.data.toString(), settings);
      inter.send(runScript);
    };
    inter.send(runScript);
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
  })
  .catch(console.log);
