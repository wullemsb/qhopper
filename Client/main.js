const { app, BrowserWindow } = require('electron')

const env = process.env.NODE_ENV || 'development';

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    center: true,
    minWidth: 1200,
    minHeight: 800,
    frame: true,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration:true
    }
  });

  mainWindow.loadFile(/* Angular dist folder path */'./dist/client/browser/index.html')
  
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})