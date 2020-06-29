import { ShortApplicationInfo } from "./short-app-info";
import { PIN } from "./pin";
import { cardInfo } from "./renderer";
import { PUK } from "./puk";

const fs = require('fs');

export namespace UI {
  export const cryptoRandomString = require('crypto-random-string');
  export const mainContainer = document.getElementById("main-container");
  export const appInfoContainer = document.getElementById("keycard__card-info");
  export const layoutContainer = document.getElementById("cmd-layout-container");

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

  export function renderAppInfo(appInfo: ShortApplicationInfo): void {
    let header = document.getElementById("app-info-header");
    header!.innerHTML = "Application Info";
    header!.classList.add("keycard__app-info-header");
    header!.classList.remove("keycard__card-info-container-message");
    document.getElementById("instance-uid")!.innerHTML = `<span class="keycard__app-info-label">Instance UID:</span> ${appInfo.instanceUID}`;
    document.getElementById("app-version")!.innerHTML = `<span class="keycard__app-info-label">Application Version:</span> ${appInfo.appVersion}`;
    document.getElementById("pairing-slots")!.innerHTML = `<span class="keycard__app-info-label">Free pairing slots:</span> ${appInfo.pairingSlots}`;
    document.getElementById("pin-retry")!.innerHTML = `<span class="keycard__app-info-label">Pin retry count:</span> ${appInfo.pinRetry}`;
    document.getElementById("puk-retry")!.innerHTML = `<span class="keycard__app-info-label">Puk retry count:</span> ${appInfo.pukRetry}`;

    if (appInfo.hasMasterKey) {
      document.getElementById("key-uid")!.innerHTML = `<span class="keycard__app-info-label">Key UID:</span> ${appInfo.keyUID}`;
    } else {
      document.getElementById("key-uid")!.innerHTML = `<span class="keycard__app-info-label">Key UID:</span> The card has no master key`;
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

  export function enableCmndBtns() {
    let btns = document.getElementsByClassName("keycard__command-disabled");
    for(let i = 0; i < btns.length; i++) {
      
    }
  }

  export function renderErrorMess(errMessage: string, messField: HTMLElement) : void {
    messField.innerHTML = errMessage;
    setTimeout(() => {
      messField.innerHTML = "";
    }, 10000);
  }
}

UI.renderVerifyPinLayout(document.getElementById("keycard-verify-pin")!, 'verify-pin.html', 'verify-puk.html', PIN.verifyPIN, PUK.verifyPUK);



