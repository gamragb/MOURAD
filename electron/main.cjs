const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');

// Configure logging for auto-updater
log.transports.file.level = "info";
autoUpdater.logger = log;

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // Load Vite dev server if in dev mode, else load built index.html
  const isDev = !app.isPackaged;
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    // mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.maximize();
    mainWindow.show();
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  // Check for updates if running in production
  if (app.isPackaged) {
    autoUpdater.checkForUpdatesAndNotify();
  }
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// Auto-Updater Events
autoUpdater.on('update-available', (info) => {
  log.info('Update available.');
  mainWindow.webContents.send('update_available', info);
});

autoUpdater.on('update-not-available', (info) => {
  log.info('Update not available.');
  mainWindow.webContents.send('update_not_available');
});

autoUpdater.on('update-downloaded', (info) => {
  log.info('Update downloaded');
  mainWindow.webContents.send('update_downloaded', info);
});

autoUpdater.on('error', (err) => {
  log.error('Error in auto-updater. ' + err);
  mainWindow.webContents.send('update_error', err == null ? "Error" : err.toString());
});

ipcMain.on('check_for_updates', () => {
  log.info('Manual update check requested');
  autoUpdater.checkForUpdatesAndNotify();
});

ipcMain.on('install_update', () => {
  log.info('Install update requested by frontend');
  autoUpdater.quitAndInstall();
});
