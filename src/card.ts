import Keycard from "keycard-sdk"
import { WebContents } from "electron";
import { InitializationData } from "./initialization-data"
import { ipcMain } from "electron"
import { ShortApplicationInfo } from "./short-app-info";
import { Utils } from "./utils";
import { Pairing } from "keycard-sdk/dist/pairing";
import { Commandset } from "keycard-sdk/dist/commandset";
import { ApplicationStatus } from "keycard-sdk/dist/application-status";
import { APDUException, WrongPINException } from "keycard-sdk/dist/apdu-exception";

const pcsclite = require("@pokusew/pcsclite");
const Store = require('electron-store');
const pairingStore = new Store();

export namespace Card {
  export function savePairing(instanceUID: Uint8Array, pairing: string): void {
    pairingStore.set(Utils.hx(instanceUID), pairing);
  }
  
  export function loadPairing(instanceUID: Uint8Array): string {
    return pairingStore.get(Utils.hx(instanceUID));
  }
  
  export function isPaired(instanceUID: Uint8Array) : boolean {
    return pairingStore.has(Utils.hx(instanceUID));
  }
  
  export function deletePairing(instanceUID: Uint8Array): void {
    pairingStore.delete(Utils.hx(instanceUID));
  }
  
  export async function connectCard(reader: any, protocol: number, window: WebContents) : Promise<void> {
    try {
      let channel = new Keycard.PCSCCardChannel(reader, protocol);
      let cmdSet = new Keycard.Commandset(channel);
      window.send('card-connected', "Selecting Keycard Wallet");
      (await cmdSet.select()).checkOK();
      
      let secureChannelOK = false;
      
      while(!secureChannelOK) {
        if (cmdSet.applicationInfo.initializedCard == false) {
          await initializeCard(cmdSet, window);
        } else {
          try {
            await pairCard(cmdSet, window);
          } catch(err) {
            continue;
          }
        }
        
        try {
          await cmdSet.autoOpenSecureChannel();
          let status = new Keycard.ApplicationStatus((await cmdSet.getStatus(Keycard.Constants.GET_STATUS_P1_APPLICATION)).checkOK().data);
          window.send('application-info', new ShortApplicationInfo(cmdSet.applicationInfo, status));
          secureChannelOK = true;
          window.send("secure-channel", "Secure Channel opened");
        } catch (err) {
          deletePairing(cmdSet.applicationInfo.instanceUID);
        }
      }
      await callCommand(cmdSet, window);
    } catch (err) {
      window.send("card-exceptions", err);
    }
  }
  
  export function initializeCard(cmdSet: Commandset, window: WebContents): Promise<void> {
    return new Promise((resolve, reject) => {
      window.send('card-need-initialization');
      ipcMain.once('initialization-data-submitted', async (event, data: InitializationData) => {
        (await cmdSet.init(data.pin, data.puk, data.pairingPassword)).checkOK();
        (await cmdSet.select()).checkOK();
        await cmdSet.autoPair(data.pairingPassword);
        (await cmdSet.select()).checkOK();
        savePairing(cmdSet.applicationInfo.instanceUID, cmdSet.getPairing().toBase64());
        event.reply("card-initialization", data);
        window.send("paired", "Paired");
        resolve();
      });
    })
  }
  
  export function pairCard(cmdSet: Commandset, window: WebContents) : Promise<void> {
    return new Promise((resolve, reject) => {
      let pairingInfo: string;
      let instanceUID = cmdSet.applicationInfo.instanceUID;
      
      if(isPaired(instanceUID)) {
        pairingInfo = loadPairing(instanceUID);
        cmdSet.setPairing(Pairing.fromString(pairingInfo));
        window.send("pairing-found", "Pairing found");
        resolve();
      } else {
        window.send("pairing-needed", "No pairing found");
        ipcMain.once("pairing-pass-submitted", async (_, pairingPassword: string) => {
          try {
            await cmdSet.autoPair(pairingPassword);
          } catch {
            reject("Error: invalid password");
            return;
          }
          (await cmdSet.select()).checkOK();
          savePairing(cmdSet.applicationInfo.instanceUID, cmdSet.getPairing().toBase64());
          window.send("paired", "Paired successfully");
          resolve();
        });
      }
    });
  }

  export async function callCommand(cmdSet: Commandset, window: WebContents) : Promise<void> {
    let status = new Keycard.ApplicationStatus((await cmdSet.getStatus(Keycard.Constants.GET_STATUS_P1_APPLICATION)).checkOK().data);

    return new Promise((resolve, reject) => {
      ipcMain.on("verify-pin", (_, pin: string) => {
        verifyPin(cmdSet, status, window, pin);
        resolve();
      });

      ipcMain.on("verify-puk", (_, puk: string) => {
        verifyPin(cmdSet, status, window, puk);
        resolve();
      });

      ipcMain.on("change-pin", (_, pin) => {
        changePin(cmdSet, status, window, pin);
        resolve();
      });

      ipcMain.on("change-puk", (_, puk) => {
        changePuk(cmdSet, status, window, puk);
        resolve();
      });

      ipcMain.on("change-pairing-password", (_, pairingPassword) => {
        changePairingPassword(cmdSet, status, window, pairingPassword);
        resolve();
      });

      ipcMain.on("unpair", async (_) => {
        unpair(cmdSet, status, window);
        resolve();
      });

      ipcMain.on("unpair-others", async (_) => {
        unpairOthers(cmdSet, status, window);
        resolve();
      });

      ipcMain.on("create-mnemonic", async (_) => {
        createMnemonic(cmdSet, status, window);
        resolve();
      });

      ipcMain.on("create-mnemonic", async (_, mnemonicList) => {
        loadMnemonic(cmdSet, status, window, mnemonicList);
        resolve();
      });

      ipcMain.on("remove-key", async (_) => {
        removeKey(cmdSet, status, window);
        resolve();
      });
    })   
  }

  export async function verifyPin(cmdSet: Commandset, status: ApplicationStatus, window: WebContents, pin: string) : Promise<void> {
    try {
      (await cmdSet.verifyPIN(pin)).checkAuthOK();
      window.send("pin-verified", "PIN verified");
    } catch (err) {
      if (err instanceof WrongPINException) {

      } else {
        throw err;   
      }
    }
    
  }

  export function verifyPuk(cmdSet: Commandset, status: ApplicationStatus, window: WebContents, puk: string) : void {

  }

  export function changePin(cmdSet: Commandset, status: ApplicationStatus, window: WebContents, pin: string) : void {

  }

  export function changePuk(cmdSet: Commandset, status: ApplicationStatus, window: WebContents, puk: string) : void {

  }

  export function changePairingPassword(cmdSet: Commandset, status: ApplicationStatus, window: WebContents, pairingPassword: string) : void {

  }

  export async function unpair(cmdSet: Commandset, status: ApplicationStatus, window: WebContents) : Promise<void> {
    await cmdSet.autoUnpair();
    window.send('application-info', new ShortApplicationInfo(cmdSet.applicationInfo, status));
    window.send('card-unpaired', "Card unpaired");
  }

  export async function unpairOthers(cmdSet: Commandset, status: ApplicationStatus, window: WebContents) : Promise<void> {
    await cmdSet.unpairOthers();
    window.send('application-info', new ShortApplicationInfo(cmdSet.applicationInfo, status));
    window.send('card-unpaired', "Other clients unpaired");
  }

  export function createMnemonic(cmdSet: Commandset, status: ApplicationStatus, window: WebContents) : void {

  }

  export function loadMnemonic(cmdSet: Commandset, status: ApplicationStatus, window: WebContents, mnemonicList: string[]) : void {

  }

  export function removeKey(cmdSet: Commandset, status: ApplicationStatus, window: WebContents) : void {

  }
   
  export function start(window: WebContents): void {
    let pcsc = pcsclite();
    
    pcsc.on('reader', (reader: any) => {
      window.send('card-detected', `New reader ${reader.name} detected`);
      
      reader.on('error', function (err: Error) {
        window.send('card-detected', `Error ${reader.name}: ${err.message}`);
      });
      
      reader.on('status', (status: any) => {
        let changes = reader.state ^ status.state;
        
        if (!changes) {
          return;
        }
        
        if ((changes & reader.SCARD_STATE_EMPTY) && (status.state & reader.SCARD_STATE_EMPTY)) {
          window.send('card-removed', `Card has been removed from ${reader.name}`);
          
          reader.disconnect(reader.SCARD_LEAVE_CARD, function (err: Error) {
            
            if (err) {
              window.send('card-disconnected', err);
              return;
            }
            
            window.send('card-disconnected', "Card has been disconnected");
          });
          
        }
        else if ((changes & reader.SCARD_STATE_PRESENT) && (status.state & reader.SCARD_STATE_PRESENT)) {
          reader.connect({ share_mode: reader.SCARD_SHARE_EXCLUSIVE }, async function (err: Error, protocol: number) {
            if (err) {
              window.send('card-connected', `Error connecting to the card: ${err.message}`);
              return;
            }
            
            await connectCard(reader, protocol, window);
          });
        }
      });
    });
  }
}