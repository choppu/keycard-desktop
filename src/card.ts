import Keycard from "keycard-sdk"
import { WebContents } from "electron";
import { InitializationData } from "./initialization-data"
import { ipcMain } from "electron"
import { SessionInfo } from "./session-info";
import { Utils } from "./utils";
import { Pairing } from "keycard-sdk/dist/pairing";
import { Commandset } from "keycard-sdk/dist/commandset";
import { WrongPINException } from "keycard-sdk/dist/apdu-exception";
import { Mnemonic } from "keycard-sdk/dist/mnemonic";
import { Constants } from "keycard-sdk/dist/constants";
import { KeyPath } from "keycard-sdk/dist/key-path";

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
      this.window.send('card-connected');
      (await this.cmdSet.select()).checkOK();
      
      while(!this.sessionInfo.secureChannelOpened) {
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
          this.window.send("secure-channel");
          this.sessionInfo.secureChannelOpened = true;
        } catch (err) {
          this.deletePairing(this.cmdSet.applicationInfo.instanceUID);
        }

        let status = new Keycard.ApplicationStatus((await this.cmdSet.getStatus(Keycard.Constants.GET_STATUS_P1_APPLICATION)).checkOK().data);
        let path = new KeyPath((await this.cmdSet.getStatus(Keycard.Constants.GET_STATUS_P1_KEY_PATH)).checkOK().data);
        this.sessionInfo.keyPath = path.toString();
        this.sessionInfo.setApplicationInfo(this.cmdSet.applicationInfo);
        this.sessionInfo.setApplicationStatus(status);
        this.window.send('application-info', this.sessionInfo);
        this.window.send("enable-pin-verification");
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
        this.window.send("paired");
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
        this.window.send("pairing-found");
        resolve();
      } else {
        this.window.send("pairing-needed");
        ipcMain.once("pairing-pass-submitted", async (_, pairingPassword: string) => {
          try {
            await this.cmdSet!.autoPair(pairingPassword);
          } catch {
            reject("Error: invalid password");
            return;
          }
          (await this.cmdSet!.select()).checkOK();
          this.savePairing(this.cmdSet!.applicationInfo.instanceUID, this.cmdSet!.getPairing().toBase64());
          this.window.send("paired");
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
      this.window.send("pin-verified");
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
      this.window.send("puk-verified");
      this.window.send("pin-verified");
      this.sessionInfo.pinVerified = true;
    } catch (err) {
      this.sessionInfo.pukRetry--;
      this.window.send('application-info', this.sessionInfo);
      if(this.sessionInfo.pukRetry > 0) {
        this.window.send("puk-screen-needed");
      } else {
        this.window.send("unblock-pin-failed");
      }
    }
  }

  async changePIN(pin: string) : Promise<void> {
    (await this.cmdSet!.changePIN(pin)).checkOK();
    this.window.send("pin-changed");
  }

  async changePUK(puk: string) : Promise<void> {
    (await this.cmdSet!.changePUK(puk)).checkOK();
    this.window.send("puk-changed");
  }

  async changePairingPassword(pairingPassword: string) : Promise<void> {
    (await this.cmdSet!.changePairingPassword(pairingPassword)).checkOK();
    this.window.send("pairing-changed");
  }

  async unpairCard() : Promise<void> {
    await this.cmdSet!.autoUnpair();
    this.deletePairing(this.cmdSet!.applicationInfo.instanceUID);
    this.window.send('card-unpaired');
  }

  async unpairOthers() : Promise<void> {
    await this.cmdSet!.unpairOthers();
    this.window.send('others-unpaired');
  }

  async createMnemonic() : Promise<void> {
    let resp = (await this.cmdSet!.generateMnemonic(Constants.GENERATE_MNEMONIC_12_WORDS)).checkOK().data;
    let mnemonicPhrase = new Mnemonic(resp);
    mnemonicPhrase.fetchBIP39EnglishWordlist();
    let keyUID = (await this.cmdSet!.loadBIP32KeyPair(mnemonicPhrase.toBIP32KeyPair())).checkOK().data;
    this.sessionInfo.keyUID = Utils.hx(keyUID);
    this.sessionInfo.hasMasterKey = true;
    this.window.send('application-info', this.sessionInfo);
    this.window.send('mnemonic-created', mnemonicPhrase.toMnemonicPhrase());
  }

  loadMnemonic(mnemonicList: string[]) : void {

  }

  async removeKey() : Promise<void> {
    await this.cmdSet!.removeKey();
    this.sessionInfo.hasMasterKey = false;
    this.window.send('application-info', this.sessionInfo);
    this.window.send('key-removed');

  }

  start(): void {
    let pcsc = pcsclite();
    let card = this;
    
    pcsc.on('reader', (reader: any) => {
      card.window.send('card-detected', reader.name);
      
      reader.on('error', function (err: Error) {
        card.window.send('card-detected', reader.name, err.message);
      });
      
      reader.on('status', (status: any) => {
        let changes = reader.state ^ status.state;
        
        if (!changes) {
          return;
        }
        
        if ((changes & reader.SCARD_STATE_EMPTY) && (status.state & reader.SCARD_STATE_EMPTY)) {
          if (card.sessionInfo.cardConnected) {
            card.window.send('card-removed', reader.name);
            card.sessionInfo.reset();
            card.window.send("application-info", card.sessionInfo);
            card.window.send("disable-cmds");
            reader.disconnect(reader.SCARD_LEAVE_CARD, (_: Error) => {});   
          }
          
        } else if ((changes & reader.SCARD_STATE_PRESENT) && (status.state & reader.SCARD_STATE_PRESENT)) {
          reader.connect({ share_mode: reader.SCARD_SHARE_EXCLUSIVE }, async function (err: Error, protocol: number) {
            card.sessionInfo.cardConnected = true;
            if (err) {
              card.window.send('card-connection-err', err.message);
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
    ipcMain.on("unpair", async (_) => this.unpairCard());
    ipcMain.on("unpair-others", async (_) => this.unpairOthers());
    ipcMain.on("create-mnemonic", async (_) => this.createMnemonic());
    ipcMain.on("create-mnemonic", async (_, mnemonicList) => this.loadMnemonic(mnemonicList));
    ipcMain.on("remove-key", async (_) => this.removeKey()); 
  }
}