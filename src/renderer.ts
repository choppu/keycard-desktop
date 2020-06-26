import { Pairing } from "keycard-sdk/dist/pairing"
import { UI } from "./ui";
import { CardInit } from "./card-init";

const { ipcRenderer } = require('electron');

export function updateLogMessage(event: string): void {
  ipcRenderer.on(event, (_, mess) => {
    UI.addMessageToLog(mess);
  });
}

ipcRenderer.on("card-disconnected", function (_, mess) {
  UI.unloadFragment();
  UI.addMessageToLog(mess);
});

ipcRenderer.on('card-need-initialization', (_, needInit) => {
  if (needInit) {
    UI.loadFragment('initialization.html', CardInit.initializeCard);
  }
});

ipcRenderer.on("paired", (_, pairingSuccess, appInfo, mess) => {
  UI.addMessageToLog(mess);
  UI.renderAppInfo(appInfo);
});

ipcRenderer.on("card-exceptions", function (_, err) {
  UI.loadErrorFragment(err);
});

updateLogMessage('card-detected');
updateLogMessage('card-removed');
updateLogMessage('card-connected');
updateLogMessage('card-disconnected');



