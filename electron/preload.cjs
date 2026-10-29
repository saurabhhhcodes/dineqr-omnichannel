// electron/preload.cjs - Safe IPC Bridge for Windows Desktop Client
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('windowsDesktopAPI', {
  isWindowsDesktop: true,
  platform: process.platform,
  getPrinters: () => ipcRenderer.invoke('get-printers'),
  printThermalReceipt: (options) => ipcRenderer.invoke('print-thermal-receipt', options),
  toggleKiosk: () => ipcRenderer.invoke('toggle-kiosk-mode'),
});
