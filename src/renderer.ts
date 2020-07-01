import { UI } from "./ui";
import { CardInit } from "./card-init";
import { Pair } from "./pair";
import { SessionInfo } from "./session-info";
import { PUK } from "./puk";
import { PIN } from "./pin";
import { Key } from "./key";

const { ipcRenderer } = require('electron');

export function updateLogMessage(event: string, msg: string): void {
  ipcRenderer.on(event, (_) => {
    UI.addMessageToLog(msg);
  });
}

ipcRenderer.on("card-removed", function (_, readerName) {
  UI.unloadFragment();
  UI.addMessageToLog(`Card has been removed from ${readerName}`);
});

ipcRenderer.on('card-detected', (_, readerName, err?) => {
  err ? UI.addMessageToLog(`Error ${readerName}: ${err}`) : UI.addMessageToLog(`New reader ${readerName} detected`);
});

ipcRenderer.on("card-connection-err", (_, err) => {
  UI.addMessageToLog(`Error connecting to the card: ${err}`);
});

ipcRenderer.on('card-need-initialization', (_) => {
  UI.loadFragment('initialization.html', CardInit.initializeCard);
});

ipcRenderer.on("pairing-needed", (_) => {
  UI.addMessageToLog("No pairing found");
  UI.loadFragment('pairing.html', Pair.pair);
})

ipcRenderer.on("application-info", function (_, sessionInfo) {
  UI.saveCardInfo(sessionInfo);
  if(sessionInfo.cardConnected) {
    UI.renderAppInfo(sessionInfo);
  } else {
    UI.renderNoAppInfo();
  } 
});

ipcRenderer.on("card-exceptions", function (_, err) {
  UI.loadErrorFragment(err);
});

ipcRenderer.on("pin-screen-needed", (_) => {
  UI.loadFragment('verify-pin.html', PIN.verifyPIN);
});

ipcRenderer.on("puk-screen-needed", (_) => {
  UI.loadFragment('verify-puk.html', PUK.verifyPUK);
});

ipcRenderer.on("pin-verified", (_) => {
  UI.enableCmndBtns();
  UI.addMessageToLog("PIN verified");
});

ipcRenderer.on('pin-verification-failed', (_, msg) => {
  UI.addMessageToLog(msg);
});

ipcRenderer.on("enable-pin-verification", (_) => {
  UI.enablePINButton();
});

ipcRenderer.on("disable-cmds", (_) => {
  UI.disableCmdBtns();
  UI.disablePINButton();
});

ipcRenderer.on('mnemonic-created', (_, wordList) => {
  UI.loadFragment('mnemonic-wordlist.html', () => (Key.renderMnemonicWordlist(wordList)));
  UI.addMessageToLog("Mnemonic created");
});

updateLogMessage('card-connected', "Selecting Keycard Wallet");
updateLogMessage('pairing-found', "Pairing found");
updateLogMessage('secure-channel', "Secure Channel opened");
updateLogMessage('paired', "Paired successfully");
updateLogMessage('puk-verified', "PIN unblocked successfully");
updateLogMessage('unblock-pin-failed', "PUK tries exceeded. The card has been blocked. Please re-install the applet.");
updateLogMessage('pin-changed', "PIN updated");
updateLogMessage('puk-changed', "PUK updated");
updateLogMessage('pairing-changed', "Pairing Password updated");
updateLogMessage('card-unpaired', "Card unpaired");
updateLogMessage('others-unpaired', "Other clients unpaired");
updateLogMessage('key-removed', "Key removed");

