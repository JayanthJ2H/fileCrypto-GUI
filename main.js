const { app, BrowserWindow ,ipcMain ,Menu } = require('electron');
const fs = require('fs');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  
  win.loadFile('index.html');

}

app.on('ready', () =>{
  Menu.setApplicationMenu(null);
  createWindow();
});

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

ipcMain.on('copy-file-data', (event, { buffer, fileName }) => {
  const destinationPath = path.join(app.getAppPath(), fileName);

  fs.writeFile(destinationPath, buffer, (err) => {
      if (err) {
          console.error('Error writing file:', err);
      } else {
          console.log(`File saved successfully to: ${destinationPath}`);
      }
  });
});