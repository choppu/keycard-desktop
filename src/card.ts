import Keycard from "keycard-sdk"
import { WebContents } from "electron";
import { InitializationData } from "./initialization-data"
import { ipcMain } from "electron"
import { ShortApplicationInfo } from "./short-app-info";
import { Utils } from "./utils";
import { Pairing } from "keycard-sdk/dist/pairing";
import { Commandset } from "keycard-sdk/dist/commandset";

const pcsclite = require("@pokusew/pcsclite");
const fs = require('fs');
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

  export function initializeCard(cmdSet: Commandset, window: WebContents): void {
    window.send('card-need-initialization', true);
    ipcMain.on('initialization-data-submitted', async (event, data: InitializationData) => {
      (await cmdSet.init(data.pin, data.puk, data.pairingPassword)).checkOK();
      (await cmdSet.select()).checkOK();
      await cmdSet.autoPair(data.pairingPassword);
      (await cmdSet.select()).checkOK();
      savePairing(cmdSet.applicationInfo.instanceUID, cmdSet.getPairing().toBase64());
      event.reply("card-initialization", data);
      let appData = new ShortApplicationInfo(cmdSet.applicationInfo);
      window.send("paired", true, appData, "Paired");
    });
  }

  export function pairCard(cmdSet: Commandset, instanceUID: Uint8Array, window: WebContents) : void {
    let pairingInfo: string;
    let appData: ShortApplicationInfo;

    if(isPaired(instanceUID)) {
      pairingInfo = loadPairing(instanceUID);
      cmdSet.setPairing(Pairing.fromString(pairingInfo));
      let appData = new ShortApplicationInfo(cmdSet.applicationInfo);
      window.send("paired", true, appData, "Pairing found");
    } else {
      window.send("pairing", false, "No pairing found");
      ipcMain.on("pairing-password-submitted", async (_, pairingPassword: string) => {
        await cmdSet.autoPair(pairingPassword);
        (await cmdSet.select()).checkOK();
        savePairing(cmdSet.applicationInfo.instanceUID, cmdSet.getPairing().toBase64());
        let appData = new ShortApplicationInfo(cmdSet.applicationInfo);
        window.send("paired", true, appData, "Paired");
      });
    }
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

            try {
              let channel = new Keycard.PCSCCardChannel(reader, protocol);
              let cmdSet = new Keycard.Commandset(channel);
              window.send('card-connected', "Selecting Keycard Wallet");
              (await cmdSet.select()).checkOK();

              if (cmdSet.applicationInfo.initializedCard == false) {
                initializeCard(cmdSet, window);
              } else {
                pairCard(cmdSet, cmdSet.applicationInfo.instanceUID, window);
              }
            } catch (err) {
              window.send("card-exceptions", err);
            }
          });

        }

      });
    });
  }
}

