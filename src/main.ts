import { Card } from "./card"

export namespace Main {
  let mainWindow: Electron.BrowserWindow;
  let application: Electron.App;
  let BrowserWindow: any;
  let card: Card;

  export function onWindowAllClosed() {
    application.quit();
  }

  export function onClose(): void {
    mainWindow.destroy();
  }

  export function onReady(): void {
    mainWindow = new BrowserWindow({
      width: 1200, height: 800, minWidth: 1200, minHeight: 800, maxHeight: 800, maxWidth: 1200, maximizable: false, webPreferences: {
        nodeIntegration: true
      }
    });
    mainWindow.loadFile('../index.html');
    mainWindow.webContents.openDevTools();
    card = new Card(mainWindow.webContents);
    mainWindow.webContents.once("dom-ready", () => {
      card.start();
    });
    mainWindow.on('closed', Main.onClose);
  }

  export function main(app: Electron.App, browserWindow: typeof BrowserWindow): void {
    BrowserWindow = browserWindow;
    application = app;
    application.on('window-all-closed', Main.onWindowAllClosed);
    application.on('ready', Main.onReady);
  }
}