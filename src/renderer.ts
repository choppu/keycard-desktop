import { Pairing } from "keycard-sdk/dist/pairing"
import { UI } from "./ui";

const { ipcRenderer } = require('electron');

export function updateLogMessage(event: string): void {
  ipcRenderer.on(event, (_, mess) => {
    UI.addMessageToLog(mess);
  });
}

ipcRenderer.on("card-disconnected", function (_, mess) {
  if (UI.initCardInterface) {
    UI.clearInitCardInterface();
  }
  UI.addMessageToLog(mess);
});

ipcRenderer.on('card-need-initialization', (_, needInit) => {
  if (needInit) {
    UI.requestInitializationScreen();
    UI.initializeCard();
  }
});

ipcRenderer.on("card-initialization", (_, initializationSuccess, initData) => {
  UI.addMessageToLog("Card initialized");
  UI.renderInitInfo(initializationSuccess, initData);
});

ipcRenderer.on("paired", (_, pairingSuccess, appInfo, mess) => {
  UI.addMessageToLog(mess);
  UI.renderAppInfo(appInfo);
});

ipcRenderer.on("card-exceptions", function (_, err) {
  UI.renderErrorInitScreen(err);
});

updateLogMessage('card-detected');
updateLogMessage('card-removed');
updateLogMessage('card-connected');
updateLogMessage('card-disconnected');



