import { UI } from "./ui";
import { CardInit } from "./card-init";
import { Pair } from "./pair";
import { PUK } from "./puk";
import { PIN } from "./pin";
import { Key } from "./key";
import { InstallApplet } from "./applet";
import { LockCard } from "./lock";

const { ipcRenderer } = require('electron');
const openSChannelBtn = document.getElementById("keycard-open-secure-channel") as HTMLButtonElement;
const verifyPinBtn = document.getElementById("keycard-verify-pin") as HTMLButtonElement;
const changePinBtn = document.getElementById("keycard-change-pin") as HTMLButtonElement;
const changePukBtn = document.getElementById("keycard-change-puk") as HTMLButtonElement;
const changePairingPassBtn = document.getElementById("keycard-change-pairing-pass") as HTMLButtonElement;
const unpairBtn = document.getElementById("keycard-unpair") as HTMLButtonElement;
const unpairOthersBtn = document.getElementById("keycard-unpair-oth") as HTMLButtonElement;
const createMnemonicBtn = document.getElementById("keycard-create-mnemonic") as HTMLButtonElement;
const loadMnemonicBtn = document.getElementById("keycard-load-mnemonic") as HTMLButtonElement;
const changeWalletBtn = document.getElementById("keycard-chage-wall") as HTMLButtonElement;
const exportKeyBtn = document.getElementById("keycard-export-key") as HTMLButtonElement;
const removeKeyBtn = document.getElementById("keycard-remove-key") as HTMLButtonElement;
const reinstallAppletBtn = document.getElementById("keycard-reinstall-applet") as HTMLButtonElement;
const lockCardBtn = document.getElementById("keycard-lock") as HTMLButtonElement;  

let isDefaultPairingPassword= true;

export function updateLogMessage(event: string, msg: string): void {
  ipcRenderer.on(event, (_) => {
    UI.addMessageToLog(msg);
  });
}

ipcRenderer.on("card-removed", (_, readerName) => {
  UI.unloadFragment();
  UI.addMessageToLog(`Card has been removed from ${readerName}`);
});

ipcRenderer.on('reader-removed', (_, readerName) => {
  UI.unloadFragment();
  UI.addMessageToLog(`Reader ${readerName} removed`);
});

ipcRenderer.on('card-detected', (_, readerName, err?) => {
  err ? UI.addMessageToLog(`Error ${readerName}: ${err}`) : UI.addMessageToLog(`New reader ${readerName} detected`);
});

ipcRenderer.on("card-connection-err", (_, err) => {
  UI.addMessageToLog(`${err}`);
});

ipcRenderer.on('card-need-initialization', (_) => {
  UI.loadFragment('initialization.html', CardInit.initializeCard);
});

ipcRenderer.on("pairing-needed", (_) => {
  UI.addMessageToLog("No pairing found");
  if (isDefaultPairingPassword) {
    isDefaultPairingPassword = false;
    ipcRenderer.send("pairing-pass-submitted", "KeycardDefaultPairing");
  } else {
    UI.loadFragment('pairing.html', Pair.pair);
  }
})

ipcRenderer.on("application-info", function (_, sessionInfo) {
  UI.saveCardInfo(sessionInfo);
  if (sessionInfo.cardConnected) {
    UI.renderAppInfo(sessionInfo);

    if (sessionInfo.pinVerified && sessionInfo.hasMasterKey) {
      UI.enableCmdButton(changeWalletBtn);
      UI.enableCmdButton(exportKeyBtn);
    } else {
      UI.disableCmdButton(changeWalletBtn);
      UI.disableCmdButton(exportKeyBtn);
    }
  } else {
    UI.renderAppInfo();
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
  UI.enableCmdButton(openSChannelBtn);
});

ipcRenderer.on("enable-applet-cmds", (_) => {
  UI.enableCmdButton(reinstallAppletBtn);
  UI.enableCmdButton(lockCardBtn);
});

ipcRenderer.on("disable-open-secure-channel", (_) => {
  UI.disableCmdButton(openSChannelBtn);
});

ipcRenderer.on("enable-pin-verification", (_) => {
  UI.enableCmdButton(verifyPinBtn);
});

ipcRenderer.on("disable-cmds", (_) => {
  UI.disableCmdBtns();
  UI.disableCmdButton(verifyPinBtn);
  UI.disableCmdButton(openSChannelBtn);
  UI.disableCmdButton(reinstallAppletBtn);
  UI.disableCmdButton(changeWalletBtn);
  UI.disableCmdButton(exportKeyBtn);
  UI.disableCmdButton(lockCardBtn)
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
});

ipcRenderer.on('key-removed', (_) => {
  UI.unloadFragment();
  UI.addMessageToLog("Key removed");
});

ipcRenderer.on('applet-inst-progress', (_, msg) => {
  InstallApplet.updateProgressMessage(msg);
});

ipcRenderer.on('applet-installed', (_) => {
  UI.unloadFragment();
  UI.addMessageToLog("Applet installed");
});

ipcRenderer.on('card-locked', (_) => {
  UI.unloadFragment();
  UI.addMessageToLog("Keycard locked");
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

UI.renderCmdScreenLayout(verifyPinBtn, PIN.verifyPIN, PUK.verifyPUK);
UI.renderCmdScreenLayout(changePinBtn, PIN.changePIN);
UI.renderCmdScreenLayout(changePukBtn, PUK.changePUK);
UI.renderCmdScreenLayout(changePairingPassBtn, Pair.changePairingPassword);
UI.renderCmdScreenLayout(unpairBtn, Pair.unpair);
UI.renderCmdScreenLayout(unpairOthersBtn, Pair.unpairOtherClients);
UI.renderCmdScreenLayout(createMnemonicBtn, Key.createMnemonic);
UI.renderCmdScreenLayout(loadMnemonicBtn, Key.loadMnemonic);
UI.renderCmdScreenLayout(changeWalletBtn, Key.changeWallet);
UI.renderCmdScreenLayout(exportKeyBtn, Key.exportKey);
UI.renderCmdScreenLayout(removeKeyBtn, Key.removeKey);
UI.renderCmdScreenLayout(reinstallAppletBtn, InstallApplet.install);
UI.renderCmdScreenLayout(lockCardBtn, LockCard.lock);    

document.getElementById("keycard-open-secure-channel")?.addEventListener("click", (e) => {
  ipcRenderer.send("open-secure-channel");
  e.preventDefault();
});
