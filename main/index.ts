import { ChildProcess, spawn } from 'node:child_process';
import { arch, platform } from 'node:os';
import path from 'node:path';
import { BrowserWindow, IpcMainEvent, Menu, Tray, app, ipcMain, nativeImage } from 'electron';
import started from 'electron-squirrel-startup';

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let goProcess: ChildProcess | null = null;
let isVpnOn: boolean = false;

if (started) {
  app.quit();
  goProcess?.kill();
  goProcess = null;
}

const getGoBinaryPath = () => {
  const ext = platform() === 'win32' ? '.exe' : '';
  const binaryName = `go_ipc_server_${platform()}_${arch()}${ext}`;
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'resources', binaryName);
  }
  return path.join(app.getAppPath(), 'resources', binaryName);
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
    maximizable: false,
    fullscreenable: false,
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
  const raw = nativeImage.createFromPath(getIconPath('tray@2x.png'));
  const icon = raw.resize({ width: 16, height: 16 });
  icon.setTemplateImage(true);

  if (tray) {
    tray.destroy();
  }
  tray = new Tray(icon);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: isVpnOn ? 'Stop' : 'Start',
      accelerator: 'CmdOrCtrl+S',
      click: () => {
        if (!goProcess || !goProcess.stdin.writable) {
          return;
        }
        if (isVpnOn) {
          goProcess.stdin.write('vpn_off\n');
          return;
        }
        goProcess.stdin.write('vpn_on\n');
      },
    },
    { type: 'separator' },
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
    { type: 'separator' },
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
          case 'vpn_status':
            mainWindow.webContents.send('vpn_status', event);
            if (isVpnOn !== event.status) {
              isVpnOn = event.status;
              createTray();
              return;
            }
            isVpnOn = event.status;
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

ipcMain.on('vpn_on', (_event: IpcMainEvent) => {
  if (!goProcess || !goProcess.stdin.writable) {
    return;
  }
  goProcess.stdin.write('vpn_on\n');
});

ipcMain.on('vpn_off', (_event: IpcMainEvent) => {
  if (!goProcess || !goProcess.stdin.writable) {
    return;
  }
  goProcess.stdin.write('vpn_off\n');
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
    goProcess?.kill();
    goProcess = null;
  }
});
