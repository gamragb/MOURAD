const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  checkForUpdates: () => ipcRenderer.send('check_for_updates'),
  onUpdateAvailable: (callback) => {
    ipcRenderer.removeAllListeners('update_available');
    ipcRenderer.on('update_available', () => callback());
  },
  onUpdateDownloaded: (callback) => {
    ipcRenderer.removeAllListeners('update_downloaded');
    ipcRenderer.on('update_downloaded', () => callback());
  },
  onUpdateError: (callback) => {
    ipcRenderer.removeAllListeners('update_error');
    ipcRenderer.on('update_error', (e, err) => callback(err));
  },
  onUpdateNotAvailable: (callback) => {
    ipcRenderer.removeAllListeners('update_not_available');
    ipcRenderer.on('update_not_available', () => callback());
  }
});
