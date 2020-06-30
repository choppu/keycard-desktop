import { UI } from "./ui";
import { CardInit } from "./card-init";
import { Pair } from "./pair";
import { SessionInfo } from "./session-info";

const { ipcRenderer } = require('electron');
export let cardInfo: SessionInfo;

export function updateLogMessage(event: string): void {
  ipcRenderer.on(event, (_, mess) => {
    UI.addMessageToLog(mess);
  });
}

ipcRenderer.on("card-removed", function (_, mess) {
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

ipcRenderer.on("application-info", function (_, sessionInfo) {
  cardInfo = sessionInfo;
  if(sessionInfo.cardConnected) {
    UI.renderAppInfo(sessionInfo);
  } else {
    UI.renderNoAppInfo();
  } 
});

ipcRenderer.on("card-exceptions", function (_, err) {
  UI.loadErrorFragment(err);
});

ipcRenderer.on("pin-verified", (_, mess) => {
  UI.enableCmndBtns();
  UI.addMessageToLog(mess);
});

updateLogMessage('card-detected');
updateLogMessage('card-connected');
updateLogMessage('pairing-found');
updateLogMessage('secure-channel');
updateLogMessage('paired');
updateLogMessage('pin-wrong');

