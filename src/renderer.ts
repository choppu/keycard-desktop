import { UI } from "./ui";
import { CardInit } from "./card-init";
import { Pair } from "./pair";
import { ShortApplicationInfo } from "./short-app-info";

const { ipcRenderer } = require('electron');
export let cardInfo: ShortApplicationInfo;
export let pinVerified = false;

export function updateLogMessage(event: string): void {
  ipcRenderer.on(event, (_, mess) => {
    UI.addMessageToLog(mess);
  });
}

ipcRenderer.on("card-disconnected", function (_, mess) {
  UI.unloadFragment();
  UI.addMessageToLog(mess);
});

ipcRenderer.on('card-need-initialization', (_) => {
  UI.loadFragment('initialization.html', CardInit.initializeCard);
});

ipcRenderer.on("pairing-needed", (_, mess) => {
  UI.addMessageToLog(mess);
  UI.loadFragment('pairing.html', Pair.pair);
})

ipcRenderer.on("application-info", function (_, appInfo) {
  cardInfo = appInfo;
  UI.renderAppInfo(appInfo);
});

ipcRenderer.on("card-exceptions", function (_, err) {
  UI.loadErrorFragment(err);
});

ipcRenderer.on("card-verified", (_, mess) => {
  pinVerified = true;
  UI.enableCmndBtns();
  UI.addMessageToLog(mess);
});

updateLogMessage('card-detected');
updateLogMessage('card-removed');
updateLogMessage('card-connected');
updateLogMessage('pairing-found');
updateLogMessage('secure-channel');
updateLogMessage('paired');

