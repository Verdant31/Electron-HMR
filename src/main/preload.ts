import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

export type Channels = 'open-camera' | 'set-user-settings' | 'start-program';
contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    sendMessage(channel: Channels, args?: unknown[]) {
      if (args) {
        ipcRenderer.send(channel, args);
      } else {
        ipcRenderer.send(channel);
      }
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },
});
