import { SessionInfo } from "./session-info";

const fs = require('fs');

export let cardInfo: SessionInfo;

const appInfoHeader = document.getElementById("app-info-header") as HTMLDivElement;
const appInfoList = document.getElementById("app-info-container") as HTMLElement;
const cashAddress = document.getElementById("cash-address") as HTMLLIElement;
const instanceUID = document.getElementById("instance-uid") as HTMLLIElement;
const appVersion = document.getElementById("app-version") as HTMLLIElement;
const pairingSlots = document.getElementById("pairing-slots") as HTMLLIElement;
const pinRetry = document.getElementById("pin-retry") as HTMLLIElement;
const pukRetry = document.getElementById("puk-retry") as HTMLLIElement;
const keyPath = document.getElementById("key-path") as HTMLLIElement;
const keyUID = document.getElementById("key-uid") as HTMLLIElement;
const mainContainer = document.getElementById("main-container");
const layoutContainer = document.getElementById("cmd-layout-container");
const btns = document.getElementsByClassName("keycard__cmd-disabled");

export namespace UI {
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

  export function renderAppInfo(appInfo?: SessionInfo): void {
    appInfoHeader.innerHTML = appInfo ? "" : "No card connected";
    
    if(appInfo) {
        appInfoHeader.classList.remove("keycard__card-info-container-message");
        appInfoList.classList.remove("keycard__hide-container");
        cashAddress.innerHTML = appInfo.cashAddress;
        instanceUID.innerHTML = appInfo.instanceUID;
        appVersion.innerHTML = appInfo.appVersion;
        pairingSlots.innerHTML = appInfo.pairingSlots;
        pinRetry.innerHTML = `${appInfo.pinRetry}`;
        pukRetry.innerHTML = `${appInfo.pukRetry}`;
        keyPath.innerHTML = appInfo.keyPath;
        keyUID.innerHTML = appInfo.keyUID || "The card has no master key";
    } else {
        appInfoHeader.innerHTML = "No card connected";
        appInfoHeader.classList.remove("keycard__app-info-header");
        appInfoHeader.classList.add("keycard__card-info-container-message");
        appInfoList.classList.add("keycard__hide-container");
    }
  }

  export function renderCmdScreenLayout(btn: HTMLButtonElement, onLoad: () => void, pukFunc?: () => void) : void {
    btn.addEventListener("click", (e) => {
      let layout = `${btn.dataset.layout}.html`;
      if(pukFunc) {
        cardInfo.pinRetry as number > 0 ? loadFragment(layout, onLoad) : loadFragment('verify-puk.html', pukFunc);
      } else {
        loadFragment(layout, onLoad);
      }
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
    Array.from(btns).map((btn) => enableCmdButton(btn as HTMLButtonElement));
  }

  export function disableCmdBtns() : void {
    Array.from(btns).map((btn) => disableCmdButton(btn as HTMLButtonElement));
  }

  export function enableCmdButton(btn: HTMLElement) : void {
    btn.removeAttribute("disabled");
  }

  export function disableCmdButton(btn: HTMLElement) : void {
    btn.setAttribute("disabled", "disabled");
  }
}
