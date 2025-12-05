import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('goApi', {
  vpnOn: () => {
    ipcRenderer.send('vpn_on');
  },
  vpnOff: () => {
    ipcRenderer.send('vpn_off');
  },
  vpnStatusEventListener: (callback: (event: object) => void) => {
    const handler = (_event: object, goEvent: object) => callback(goEvent);
    ipcRenderer.on('vpn_status', handler);
    return () => ipcRenderer.removeListener('vpn_status', handler);
  },
});
