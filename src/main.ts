import { ChildProcess, spawn } from 'node:child_process';
import path from 'node:path';
import { BrowserWindow, IpcMainEvent, Menu, Tray, app, ipcMain, nativeImage } from 'electron';
import started from 'electron-squirrel-startup';

if (started) {
  app.quit();
}

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let goProcess: ChildProcess | null = null;

const getGoBinaryPath = () => {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'resources', 'go_ipc_server');
  }
  return path.join(app.getAppPath(), 'resources', 'go_ipc_server');
};

const getIconPath = (filename: string) => {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'assets', filename);
  }
  return path.join(app.getAppPath(), 'assets', filename);
};

const createWindow = () => {
  mainWindow = new BrowserWindow({
    title: 'StarMesh',
    icon: nativeImage.createFromPath(getIconPath('icon.ico')),
    width: 340,
    height: 600,
    resizable: false,
    fullscreenable: false,
    roundedCorners: true,
    titleBarStyle: 'hidden',
    webPreferences: {
      devTools: !app.isPackaged,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }
};

const createTray = () => {
  const icon = nativeImage.createFromPath(getIconPath('tray.png'));
  if (process.platform === 'darwin') {
    icon.setTemplateImage(true);
  }

  tray = new Tray(icon);
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Start',
      accelerator: 'CmdOrCtrl+S',
      click: () => {},
    },
    {
      label: 'Open',
      accelerator: 'CmdOrCtrl+O',
      click: () => {
        if (BrowserWindow.getAllWindows().length === 0) {
          createWindow();
          return;
        }
        mainWindow?.focus();
      },
    },
    {
      label: 'Quit',
      accelerator: 'CmdOrCtrl+Q',
      click: () => app.quit(),
    },
  ]);

  tray.setContextMenu(contextMenu);
};

const createChildProcess = () => {
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

app.on('ready', () => {
  createWindow();
  createTray();
  createChildProcess();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
