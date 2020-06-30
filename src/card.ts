import Keycard from "keycard-sdk"
import { WebContents } from "electron";
import { InitializationData } from "./initialization-data"
import { ipcMain } from "electron"
import { SessionInfo } from "./session-info";
import { Utils } from "./utils";
import { Pairing } from "keycard-sdk/dist/pairing";
import { Commandset } from "keycard-sdk/dist/commandset";
import { WrongPINException } from "keycard-sdk/dist/apdu-exception";

const pcsclite = require("@pokusew/pcsclite");
const Store = require('electron-store');

const maxPINRetryCount = 3;
const maxPUKRetryCount = 5;

export class Card {
  window: WebContents;
  cmdSet?: Commandset;
  sessionInfo: SessionInfo;
  pairingStore: any;
  
  constructor(window: WebContents) {
    this.window = window;
    this.pairingStore = new Store();
    this.sessionInfo = new SessionInfo();
    this.installEventHandlers();
  }

  savePairing(instanceUID: Uint8Array, pairing: string): void {
    this.pairingStore.set(Utils.hx(instanceUID), pairing);
  }
  
  loadPairing(instanceUID: Uint8Array): string {
    return this.pairingStore.get(Utils.hx(instanceUID));
  }
  
  isPaired(instanceUID: Uint8Array) : boolean {
    return this.pairingStore.has(Utils.hx(instanceUID));
  }
  
  deletePairing(instanceUID: Uint8Array): void {
    this.pairingStore.delete(Utils.hx(instanceUID));
  }
  
  async connectCard(reader: any, protocol: number) : Promise<void> {
    try {
      let channel = new Keycard.PCSCCardChannel(reader, protocol);
      this.cmdSet = new Keycard.Commandset(channel);
      this.window.send('card-connected', "Selecting Keycard Wallet");
      (await this.cmdSet.select()).checkOK();
      
      let secureChannelOK = false;
      
      while(!secureChannelOK) {
        if (this.cmdSet.applicationInfo.initializedCard == false) {
          await this.initializeCard();
        } else {
          try {
            await this.pairCard();
          } catch(err) {
            continue;
          }
        }
        
        try {
          await this.cmdSet.autoOpenSecureChannel();
          secureChannelOK = true;
          this.window.send("secure-channel", "Secure Channel opened");
          this.sessionInfo.secureChannelOpened = true;
        } catch (err) {
          this.deletePairing(this.cmdSet.applicationInfo.instanceUID);
        }

        let status = new Keycard.ApplicationStatus((await this.cmdSet.getStatus(Keycard.Constants.GET_STATUS_P1_APPLICATION)).checkOK().data);
        this.sessionInfo.setApplicationInfo(this.cmdSet.applicationInfo);
        this.sessionInfo.setApplicationStatus(status);
        this.window.send('application-info', this.sessionInfo);
      }
    } catch (err) {
      this.window.send("card-exceptions", err);
    }
  }
  
  initializeCard(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.window.send('card-need-initialization');
      ipcMain.once('initialization-data-submitted', async (event, data: InitializationData) => {
        (await this.cmdSet!.init(data.pin, data.puk, data.pairingPassword)).checkOK();
        (await this.cmdSet!.select()).checkOK();
        await this.cmdSet!.autoPair(data.pairingPassword);
        (await this.cmdSet!.select()).checkOK();
        this.savePairing(this.cmdSet!.applicationInfo.instanceUID, this.cmdSet!.getPairing().toBase64());
        event.reply("card-initialization", data);
        this.window.send("paired", "Paired");
        resolve();
      });
    })
  }
  
  pairCard() : Promise<void> {
    return new Promise((resolve, reject) => {
      let pairingInfo: string;
      let instanceUID = this.cmdSet!.applicationInfo.instanceUID;
      
      if(this.isPaired(instanceUID)) {
        pairingInfo = this.loadPairing(instanceUID);
        this.cmdSet!.setPairing(Pairing.fromString(pairingInfo));
        this.window.send("pairing-found", "Pairing found");
        resolve();
      } else {
        this.window.send("pairing-needed", "No pairing found");
        ipcMain.once("pairing-pass-submitted", async (_, pairingPassword: string) => {
          try {
            await this.cmdSet!.autoPair(pairingPassword);
          } catch {
            reject("Error: invalid password");
            return;
          }
          (await this.cmdSet!.select()).checkOK();
          this.savePairing(this.cmdSet!.applicationInfo.instanceUID, this.cmdSet!.getPairing().toBase64());
          this.window.send("paired", "Paired successfully");
          resolve();
        });
      }
    });
  }

  async verifyPIN(pin: string) : Promise<void> {
    try {
      (await this.cmdSet!.verifyPIN(pin)).checkAuthOK();
      this.sessionInfo.pinRetry = maxPINRetryCount;
      this.window.send('application-info', this.sessionInfo);
      this.window.send("pin-verified", "PIN verified");
      this.sessionInfo.pinVerified = true;
    } catch (err) {
      if (err.retryAttempts != undefined) {
        this.sessionInfo.pinRetry = err.retryAttempts;
        this.window.send('application-info', this.sessionInfo);

        if(err.retryAttempts > 0) {
          this.window.send("pin-screen-needed");
        } else {
          this.window.send("puk-screen-needed");
          this.window.send("pin-verification-failed", err.message);
        }
      } else {
        throw err;   
      }
    }
  }

  async verifyPUK(puk: string, newPin: string) : Promise<void> {
    try {
      (await this.cmdSet!.unblockPIN(puk, newPin)).checkOK();
      this.sessionInfo.pinRetry = maxPINRetryCount;
      this.sessionInfo.pukRetry = maxPUKRetryCount;
      this.window.send('application-info', this.sessionInfo);
      this.window.send("puk-verified", "PIN unblocked successfully");
      this.window.send("pin-verified", "PIN verified");
      this.sessionInfo.pinVerified = true;
    } catch (err) {
      this.sessionInfo.pukRetry--;
      this.window.send('application-info', this.sessionInfo);
      if(this.sessionInfo.pukRetry > 0) {
        this.window.send("puk-screen-needed");
      } else {
        this.window.send("unblock-pin-failed", "PUK tries exceeded. The card has been blocked. Please re-install the applet.");
      }
    }
  }

  changePIN(pin: string) : void {

  }

  changePUK(puk: string) : void {

  }

  changePairingPassword(cpairingPassword: string) : void {

  }

  async unpair() : Promise<void> {
    await this.cmdSet!.autoUnpair();
    this.window.send('card-unpaired', "Card unpaired");
  }

  async unpairOthers() : Promise<void> {
    await this.cmdSet!.unpairOthers();
    this.window.send('card-unpaired', "Other clients unpaired");
  }

  createMnemonic() : void {

  }

  loadMnemonic(mnemonicList: string[]) : void {

  }

  removeKey() : void {

  }

  start(): void {
    let pcsc = pcsclite();
    let card = this;
    
    pcsc.on('reader', (reader: any) => {
      card.window.send('card-detected', `New reader ${reader.name} detected`);
      
      reader.on('error', function (err: Error) {
        card.window.send('card-detected', `Error ${reader.name}: ${err.message}`);
      });
      
      reader.on('status', (status: any) => {
        let changes = reader.state ^ status.state;
        
        if (!changes) {
          return;
        }
        
        if ((changes & reader.SCARD_STATE_EMPTY) && (status.state & reader.SCARD_STATE_EMPTY)) {
          if (card.sessionInfo.cardConnected) {
            card.window.send('card-removed', `Card has been removed from ${reader.name}`);
            card.sessionInfo.reset();
            card.window.send("application-info", card.sessionInfo);
            reader.disconnect(reader.SCARD_LEAVE_CARD, (_: Error) => {});   
          }
          
        } else if ((changes & reader.SCARD_STATE_PRESENT) && (status.state & reader.SCARD_STATE_PRESENT)) {
          reader.connect({ share_mode: reader.SCARD_SHARE_EXCLUSIVE }, async function (err: Error, protocol: number) {
            card.sessionInfo.cardConnected = true;
            if (err) {
              card.window.send('card-connected', `Error connecting to the card: ${err.message}`);
              return;
            }
            card.connectCard(reader, protocol);
          });
        }
      });
    });   
  }

  installEventHandlers() : void {
    ipcMain.on("verify-pin", (_, pin: string) => this.verifyPIN(pin));
    ipcMain.on("verify-puk", (_, puk: string, newPin: string) => this.verifyPUK(puk, newPin));
    ipcMain.on("change-pin", (_, pin) => this.changePIN(pin));
    ipcMain.on("change-puk", (_, puk) => this.changePUK(puk));
    ipcMain.on("change-pairing-password", (_, pairingPassword) => this.changePairingPassword(pairingPassword));
    ipcMain.on("unpair", async (_) => this.unpair());
    ipcMain.on("unpair-others", async (_) => this.unpairOthers());
    ipcMain.on("create-mnemonic", async (_) => this.createMnemonic());
    ipcMain.on("create-mnemonic", async (_, mnemonicList) => this.loadMnemonic(mnemonicList));
    ipcMain.on("remove-key", async (_) => this.removeKey()); 
  }
}