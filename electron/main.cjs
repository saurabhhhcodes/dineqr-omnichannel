// electron/main.cjs - Native Windows Desktop Client for Clinics, Hospitals & Restaurants
const { app, BrowserWindow, ipcMain, Menu, Tray, dialog } = require('electron');
const path = require('path');

let mainWindow = null;
let tray = null;

// Determine target URL: Local Express server or built files
const TARGET_URL = process.env.ELECTRON_START_URL || 'http://localhost:3001/admin';

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 1024,
    minHeight: 700,
    title: 'DineQR Desktop POS & Clinic Reception Suite (Windows Edition)',
    backgroundColor: '#0f172a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
    },
    icon: path.join(__dirname, '../public/icon.png'),
  });

  // Load URL
  mainWindow.loadURL(TARGET_URL).catch((err) => {
    console.error('Failed to load local server, retrying in 2 seconds...', err.message);
    setTimeout(() => {
      mainWindow.loadURL(TARGET_URL);
    }, 2000);
  });

  // Windows Desktop Custom Menu
  const menuTemplate = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Print Active Receipt / Slip (Ctrl+P)',
          accelerator: 'CmdOrCtrl+P',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.print({ silent: false, printBackground: true });
            }
          },
        },
        {
          label: 'Silent POS Thermal Print (80mm/58mm)',
          accelerator: 'CmdOrCtrl+Shift+P',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.print({
                silent: true,
                printBackground: true,
                margins: { marginType: 'none' },
              });
            }
          },
        },
        { type: 'separator' },
        { label: 'Exit', role: 'quit' },
      ],
    },
    {
      label: 'Portals',
      submenu: [
        {
          label: 'Admin Operations & Analytics',
          click: () => mainWindow.loadURL('http://localhost:3001/admin'),
        },
        {
          label: 'Kitchen / Clinic Token Queue (KDS)',
          click: () => mainWindow.loadURL('http://localhost:3001/admin/kitchen'),
        },
        {
          label: 'Table & Room QR Placard Manager',
          click: () => mainWindow.loadURL('http://localhost:3001/admin/tables'),
        },
        {
          label: 'Super Admin Multi-Tenant Portal',
          click: () => mainWindow.loadURL('http://localhost:3001/super-admin'),
        },
        {
          label: 'Client Self-Onboarding Portal',
          click: () => mainWindow.loadURL('http://localhost:3001/onboard'),
        },
        { type: 'separator' },
        {
          label: 'Customer Menu Simulation (Table 01)',
          click: () => mainWindow.loadURL('http://localhost:3001/menu?table=tbl_1'),
        },
      ],
    },
    {
      label: 'Kiosk & View',
      submenu: [
        {
          label: 'Toggle Fullscreen Kiosk Mode (F11)',
          accelerator: 'F11',
          click: () => {
            const isKiosk = mainWindow.isKiosk();
            mainWindow.setKiosk(!isKiosk);
          },
        },
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC Handlers for Windows Hardware Interop
ipcMain.handle('get-printers', async () => {
  if (!mainWindow) return [];
  return await mainWindow.webContents.getPrintersAsync();
});

ipcMain.handle('print-thermal-receipt', async (event, options = {}) => {
  if (!mainWindow) return { success: false, error: 'No active window' };
  try {
    mainWindow.webContents.print({
      silent: options.silent !== false,
      printBackground: true,
      deviceName: options.deviceName || '',
      margins: { marginType: 'none' },
      pageSize: options.pageSize || 'RollPaper', // 80mm thermal receipt
    });
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('toggle-kiosk-mode', async () => {
  if (!mainWindow) return false;
  const current = mainWindow.isKiosk();
  mainWindow.setKiosk(!current);
  return !current;
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
