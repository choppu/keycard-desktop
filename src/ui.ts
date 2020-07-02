import { SessionInfo } from "./session-info";
import { PIN } from "./pin";
import { PUK } from "./puk";
import { Pair } from "./pair";
import { Key } from "./key";

const fs = require('fs');

export let cardInfo: SessionInfo;

export namespace UI {
  export const cryptoRandomString = require('crypto-random-string');
  export const mainContainer = document.getElementById("main-container");
  export const appInfoContainer = document.getElementById("keycard__card-info");
  export const layoutContainer = document.getElementById("cmd-layout-container");

  const btns = document.getElementsByClassName("keycard__cmd-disabled");
  
  export function saveCardInfo(appInfo: SessionInfo) : void {
    cardInfo = appInfo;
  }

  export function addMessageToLog(mess: string): void {
    let logContainer = document.getElementById('keycard-log-container');
    let message = document.createElement("p");
    let date = new Date().toLocaleTimeString();

    if (logContainer) {
      logContainer.appendChild(message);
      message.classList.add("keycard__card-info-container-message-text");
      message.innerHTML = `${date}: ${mess}`;
    }
  }

  export function renderAppInfo(appInfo: SessionInfo): void {
    let header = document.getElementById("app-info-header");
    header!.innerHTML = "";
    header!.classList.remove("keycard__card-info-container-message");
    document.getElementById("cash-address")!.innerHTML = `<span class="keycard__app-info-label">Cash Address</span> ${appInfo.cashAddress}`;
    document.getElementById("instance-uid")!.innerHTML = `<span class="keycard__app-info-label">Instance UID</span> ${appInfo.instanceUID}`;
    document.getElementById("app-version")!.innerHTML = `<span class="keycard__app-info-label">Application Version</span> ${appInfo.appVersion}`;
    document.getElementById("pairing-slots")!.innerHTML = `<span class="keycard__app-info-label">Free pairing slots</span> ${appInfo.pairingSlots}`;
    document.getElementById("pin-retry")!.innerHTML = `<span class="keycard__app-info-label">PIN retry count</span> ${appInfo.pinRetry}`;
    document.getElementById("puk-retry")!.innerHTML = `<span class="keycard__app-info-label">PUK retry count</span> ${appInfo.pukRetry}`;
    document.getElementById("key-path")!.innerHTML = `<span class="keycard__app-info-label">Wallet Path</span> ${appInfo.keyPath}`;

    if (appInfo.hasMasterKey) {
      document.getElementById("key-uid")!.innerHTML = `<span class="keycard__app-info-label">Mnemonic UID</span> ${appInfo.keyUID}`;
    } else {
      document.getElementById("key-uid")!.innerHTML = `<span class="keycard__app-info-label">Mnemonic UID</span> The card has no master key`;
    }
  }

  export function renderCmdScreenLayout(btn: HTMLElement, layoutPath: string, onLoad: () => void) : void {
    btn.addEventListener("click", (e) => {
      loadFragment(layoutPath, onLoad);
      e.preventDefault();
    });
  }

  export function renderVerifyPinLayout(btn: HTMLElement, layoutPin: string, layoutPuk: string, pinFunc: () => void, pukFunc: () => void) : void {
    btn.addEventListener("click", (e) => {
      cardInfo.pinRetry > 0 ? loadFragment(layoutPin, pinFunc) : loadFragment(layoutPuk, pukFunc);
      e.preventDefault();
    });
  }

  export function loadFragment(filename: string, onLoad: () => void) : void {
    let path = `${__dirname}/../layouts/${filename}`;
    layoutContainer!.innerHTML = "";

    mainContainer?.classList.add("keycard__card-info-container-hidden");
    mainContainer?.classList.remove("keycard__main-container");
    layoutContainer?.classList.remove("keycard__card-info-container-hidden");
    layoutContainer?.classList.add("keycard__pairing-container");

    fs.readFile(path, (_: Error, layout: string) => {
      layoutContainer!.innerHTML = layout;
      onLoad();
    });
  }

  export function unloadFragment(): void {
    layoutContainer!.innerHTML = "";
    layoutContainer?.classList.add("keycard__card-info-container-hidden");
    layoutContainer?.classList.remove("keycard__pairing-container");
    mainContainer?.classList.remove("keycard__card-info-container-hidden");
    mainContainer?.classList.add("keycard__main-container");
  }

  export function loadErrorFragment(err: Error): void {
    loadFragment('error.html', () => {
      let errorMessage = document.getElementById("error-message");

      errorMessage!.innerHTML = `${err}`;
  
      document.getElementById("btn-error")?.addEventListener("click", function (e) {
        UI.unloadFragment();
        e.preventDefault();
      });
    });
  }

  export function enableCmndBtns() : void {
    for(let i = 0; i < btns.length; i++) {
      btns[i].removeAttribute("disabled");
    }
  }

  export function disableCmdBtns() : void {
    for(let i = 0; i < btns.length; i++) {
      btns[i].setAttribute("disabled", "disabled");
    }
  }

  export function enableCmdButton(btn: HTMLElement) : void {
    btn.removeAttribute("disabled");
  }

  export function disableCmdButton(btn: HTMLElement) : void {
    btn.setAttribute("disabled", "disabled");
  }

  export function renderErrorMess(errMessage: string, messField: HTMLElement) : void {
    messField.innerHTML = errMessage;
    setTimeout(() => {
      messField.innerHTML = "";
    }, 10000);
  }

  export function renderNoAppInfo() : void {
    let header = document.getElementById("app-info-header");
    header!.innerHTML = "No card connected";
    header!.classList.remove("keycard__app-info-header");
    header!.classList.add("keycard__card-info-container-message");
    document.getElementById("cash-address")!.innerHTML = "";
    document.getElementById("instance-uid")!.innerHTML = "";
    document.getElementById("app-version")!.innerHTML = "";
    document.getElementById("pairing-slots")!.innerHTML = "";
    document.getElementById("pin-retry")!.innerHTML = "";
    document.getElementById("puk-retry")!.innerHTML = "";
    document.getElementById("key-uid")!.innerHTML = "";
    document.getElementById("key-path")!.innerHTML = "";
  }
}
