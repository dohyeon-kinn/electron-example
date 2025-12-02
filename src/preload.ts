import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('goApi', {
  ping: () => {
    ipcRenderer.send('ping');
  },
  pongEventListener: (callback: (event: object) => void) => {
    const handler = (_event: object, goEvent: object) => callback(goEvent);
    ipcRenderer.on('pong-event', handler);
    return () => ipcRenderer.removeListener('pong-event', handler);
  },
  statusEventListener: (callback: (event: object) => void) => {
    const handler = (_event: object, goEvent: object) => callback(goEvent);
    ipcRenderer.on('status-event', handler);
    return () => ipcRenderer.removeListener('status-event', handler);
  },
});
