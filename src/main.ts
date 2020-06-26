import { Card } from "./card"

export namespace Main {
  let mainWindow: Electron.BrowserWindow;
  let application: Electron.App;
  let BrowserWindow: any;

  export function onWindowAllClosed() {
    application.quit();
  }

  export function onClose(): void {
    mainWindow.destroy();
  }

  export function onReady(): void {
    mainWindow = new BrowserWindow({
      width: 900, height: 750, minWidth: 900, minHeight: 750, maxHeight: 750, maxWidth: 1200, maximizable: false, webPreferences: {
        nodeIntegration: true
      }
    });
    mainWindow.loadFile('../index.html');
    mainWindow.webContents.openDevTools();
    Card.start(mainWindow.webContents);
    mainWindow.on('closed', Main.onClose);
  }

  export function main(app: Electron.App, browserWindow: typeof BrowserWindow): void {
    BrowserWindow = browserWindow;
    application = app;
    application.on('window-all-closed', Main.onWindowAllClosed);
    application.on('ready', Main.onReady);
  }
}