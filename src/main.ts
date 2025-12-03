import { ChildProcess, spawn } from 'node:child_process';
import path from 'node:path';
import { BrowserWindow, IpcMainEvent, app, ipcMain } from 'electron';
import started from 'electron-squirrel-startup';

if (started) {
  app.quit();
}

let goProcess: ChildProcess | null = null;
const getGoBinaryPath = () => {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'resources', 'go_ipc_server');
  }
  return path.join(app.getAppPath(), 'resources', 'go_ipc_server');
};

const getIconPath = () => {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'assets', 'icon.ico');
  }
  return path.join(app.getAppPath(), 'assets', 'icon.ico');
};

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    title: 'StarMesh',
    icon: getIconPath(),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  if (!goProcess) {
    goProcess = spawn(getGoBinaryPath(), [], { shell: false });
    goProcess.stdout.on('data', (data) => {
      const output = data.toString().trim();
      try {
        const event = JSON.parse(output);
        switch (event.type) {
          case 'status':
            mainWindow.webContents.send('status-event', event);
            break;
          case 'pong':
            mainWindow.webContents.send('pong-event', event);
            break;
          default:
            break;
        }
      } catch {}
    });
    goProcess.on('close', () => {
      goProcess = null;
    });
  }
};

ipcMain.on('ping', (_event: IpcMainEvent) => {
  if (!goProcess || !goProcess.stdin.writable) {
    return;
  }
  goProcess.stdin.write('ping\n');
});

app.on('ready', createWindow);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
