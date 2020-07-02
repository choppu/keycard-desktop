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

    if (sessionInfo.pinVerified && sessionInfo.hasMasterKey) {
      UI.enableCmdButton(document.getElementById("keycard-chage-wall")!);
      UI.enableCmdButton(document.getElementById("keycard-export-key")!);
    } else {
      UI.disableCmdButton(document.getElementById("keycard-chage-wall")!);
      UI.disableCmdButton(document.getElementById("keycard-export-key")!);
    }
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

ipcRenderer.on("enable-open-secure-channel", (_) => {
  UI.enableCmdButton(document.getElementById("keycard-open-secure-channel")!);
});

ipcRenderer.on("disable-open-secure-channel", (_) => {
  UI.disableCmdButton(document.getElementById("keycard-open-secure-channel")!);
});

ipcRenderer.on("enable-pin-verification", (_) => {
  UI.enableCmdButton(document.getElementById("keycard-verify-pin")!);
});

ipcRenderer.on("disable-cmds", (_) => {
  UI.disableCmdBtns();
  UI.disableCmdButton(document.getElementById("keycard-verify-pin")!);
  UI.disableCmdButton(document.getElementById("keycard-open-secure-channel")!);
});

ipcRenderer.on('mnemonic-created', (_, wordList) => {
  UI.loadFragment('mnemonic-wordlist.html', () => (Key.renderMnemonicWordlist(wordList)));
  UI.addMessageToLog("Mnemonic created");
});

ipcRenderer.on('wallet-changed', (_, wordList) => {
  UI.unloadFragment();
  UI.addMessageToLog("Wallet changed");
});

ipcRenderer.on('card-unpaired', (_) => {
  UI.unloadFragment();
  UI.addMessageToLog("Card unpaired");
});

ipcRenderer.on('others-unpaired', (_) => {
  UI.unloadFragment();
  UI.addMessageToLog("Other clients unpaired");
});

ipcRenderer.on('key-exported', (_, pubKey, ethAddr) => {
  UI.loadFragment('export-key.html', () => (Key.generateExportKeyData(pubKey, ethAddr)));
  UI.addMessageToLog("Wallet Data exported");
});

ipcRenderer.on('key-removed', (_) => {
  UI.unloadFragment();
  UI.addMessageToLog("Key removed");
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
updateLogMessage('mnemonic-loaded', "Mnemonic loaded");

UI.renderVerifyPinLayout(document.getElementById("keycard-verify-pin")!, 'verify-pin.html', 'verify-puk.html', PIN.verifyPIN, PUK.verifyPUK);
UI.renderCmdScreenLayout(document.getElementById("keycard-change-pin")!, 'change-pin.html', PIN.changePIN);
UI.renderCmdScreenLayout(document.getElementById("keycard-change-puk")!, 'change-puk.html', PUK.changePUK);
UI.renderCmdScreenLayout(document.getElementById("keycard-change-pairing-pass")!, 'change-pairing.html', Pair.changePairingPassword);
UI.renderCmdScreenLayout(document.getElementById("keycard-unpair")!, 'unpair.html', Pair.unpair);
UI.renderCmdScreenLayout(document.getElementById("keycard-unpair-oth")!, 'unpair.html', Pair.unpairOtherClients);
UI.renderCmdScreenLayout(document.getElementById("keycard-create-mnemonic")!, 'waiting.html', Key.createMnemonic);
UI.renderCmdScreenLayout(document.getElementById("keycard-load-mnemonic")!, 'load-mnemonic.html', Key.loadMnemonic);
UI.renderCmdScreenLayout(document.getElementById("keycard-chage-wall")!, 'change-wallet.html', Key.changeWallet);
UI.renderCmdScreenLayout(document.getElementById("keycard-export-key")!, 'waiting.html', Key.exportKey);
UI.renderCmdScreenLayout(document.getElementById("keycard-remove-key")!, 'remove-key.html', Key.removeKey);

document.getElementById("keycard-open-secure-channel")?.addEventListener("click", (e) => {
  ipcRenderer.send("open-secure-channel");
  e.preventDefault();
});
