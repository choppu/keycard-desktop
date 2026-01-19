import { UI } from "./ui";
import { CardInit } from "./card-init";
import { Pair } from "./pair";
import { PUK } from "./puk";
import { PIN } from "./pin";
import { Key } from "./key";
import { InstallApplet } from "./applet";
import { LockCard } from "./lock";
import { SessionInfo } from "./session-info";

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
  ipcRenderer.on(event, (_: any) => {
    UI.addMessageToLog(msg);
  });
}

ipcRenderer.on("card-removed", (_: any, readerName: string) => {
  UI.unloadFragment();
  UI.addMessageToLog(`Card has been removed from ${readerName}`);
});

ipcRenderer.on('reader-removed', (_: any, readerName: string) => {
  UI.unloadFragment();
  UI.addMessageToLog(`Reader ${readerName} removed`);
});

ipcRenderer.on('card-detected', (_: any, readerName: string, err?: any) => {
  err ? UI.addMessageToLog(`Error ${readerName}: ${err}`) : UI.addMessageToLog(`New reader ${readerName} detected`);
});

ipcRenderer.on("card-connection-err", (_: any, err: any) => {
  UI.addMessageToLog(`${err}`);
});

ipcRenderer.on('card-need-initialization', (_: any) => {
  UI.loadFragment('initialization.html', CardInit.initializeCard);
});

ipcRenderer.on("pairing-needed", (_: any) => {
  UI.addMessageToLog("No pairing found");
  if (isDefaultPairingPassword) {
    isDefaultPairingPassword = false;
    ipcRenderer.send("pairing-pass-submitted", "KeycardDefaultPairing");
  } else {
    UI.loadFragment('pairing.html', Pair.pair);
  }
})

ipcRenderer.on("application-info", function (_: any, sessionInfo: SessionInfo) {
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

ipcRenderer.on("card-exceptions", function (_: any, err: any) {
  UI.loadErrorFragment(err);
});

ipcRenderer.on("pin-screen-needed", (_: any) => {
  UI.loadFragment('verify-pin.html', PIN.verifyPIN);
});

ipcRenderer.on("puk-screen-needed", (_: any) => {
  UI.loadFragment('verify-puk.html', PUK.verifyPUK);
});

ipcRenderer.on("pin-verified", (_: any) => {
  UI.enableCmndBtns();
  UI.addMessageToLog("PIN verified");
});

ipcRenderer.on('pin-verification-failed', (_: any, msg: string) => {
  UI.addMessageToLog(msg);
});

ipcRenderer.on("enable-open-secure-channel", (_: any) => {
  UI.enableCmdButton(openSChannelBtn);
});

ipcRenderer.on("enable-applet-cmds", (_: any) => {
  UI.enableCmdButton(reinstallAppletBtn);
  UI.enableCmdButton(lockCardBtn);
});

ipcRenderer.on("disable-open-secure-channel", (_: any) => {
  UI.disableCmdButton(openSChannelBtn);
});

ipcRenderer.on("enable-pin-verification", (_: any) => {
  UI.enableCmdButton(verifyPinBtn);
});

ipcRenderer.on("enable-install-applet", (_: any) => {
  UI.enableCmdButton(reinstallAppletBtn);
});

ipcRenderer.on("disable-cmds", (_: any) => {
  UI.disableCmdBtns();
  UI.disableCmdButton(verifyPinBtn);
  UI.disableCmdButton(openSChannelBtn);
  UI.disableCmdButton(reinstallAppletBtn);
  UI.disableCmdButton(changeWalletBtn);
  UI.disableCmdButton(exportKeyBtn);
  UI.disableCmdButton(lockCardBtn)
});

ipcRenderer.on('mnemonic-created', (_: any, wordList: string) => {
  UI.loadFragment('mnemonic-wordlist.html', () => (Key.renderMnemonicWordlist(wordList)));
  UI.addMessageToLog("Mnemonic created");
});

ipcRenderer.on('wallet-changed', (_: any, wordList: string) => {
  UI.unloadFragment();
  UI.addMessageToLog("Wallet changed");
});

ipcRenderer.on('card-unpaired', (_: any) => {
  UI.unloadFragment();
  UI.addMessageToLog("Card unpaired");
});

ipcRenderer.on('others-unpaired', (_: any) => {
  UI.unloadFragment();
  UI.addMessageToLog("Other clients unpaired");
});

ipcRenderer.on('key-exported', (_: any, pubKey: string, ethAddr: string) => {
  UI.loadFragment('export-key.html', () => (Key.generateExportKeyData(pubKey, ethAddr)));
});

ipcRenderer.on('key-removed', (_: any) => {
  UI.unloadFragment();
  UI.addMessageToLog("Key removed");
});

ipcRenderer.on('applet-inst-progress', (_: any, msg: string) => {
  InstallApplet.updateProgressMessage(msg);
});

ipcRenderer.on('applet-installed', (_: any) => {
  UI.unloadFragment();
  UI.addMessageToLog("Applet installed");
});

ipcRenderer.on('card-locked', (_: any) => {
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
