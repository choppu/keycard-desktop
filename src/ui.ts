import { ShortApplicationInfo } from "./short-app-info";
import { InitializationData } from "./initialization-data";
import { Utils } from "./utils";

const fs = require('fs');

export namespace UI {
  export const cryptoRandomString = require('crypto-random-string');
  export const mainContainer = document.getElementById("main-container");
  export const initializationContainer = document.getElementById("initialization-container");
  export const initializationDataContainer = document.getElementById("keycard-init-data");
  export const imgContainer = document.getElementById("keycard-init-data-img-container");
  export const appInfoContainer = document.getElementById("keycard__card-info");

  const { ipcRenderer } = require('electron');
  export let initCardInterface = false;

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

  export function appendInitInfoImg(img: HTMLImageElement, path: string): void {
    imgContainer?.append(img);
    img.src = path;
    img.classList.add("keycard__img");
  }

  export function appendInitInfoBtn(btn: HTMLInputElement, id: string): void {
    initializationDataContainer?.append(btn);
    btn.type = "button";
    btn.value = "OK";
    btn.id = id;
    btn.classList.add("keycard__btn");
  }

  export function requestInitializationScreen(): void {
    mainContainer?.classList.add("keycard__card-info-container-hidden");
    mainContainer?.classList.remove("keycard__main-container");
    initializationContainer?.classList.remove("keycard__card-info-container-hidden");
    initializationContainer?.classList.add("keycard__pairing-container");
  }

  export function initializeCard(): void {
    let pinFields = document.getElementsByTagName("input");
    let button = document.getElementById("initialize-btn");
    let pin: string;

    initCardInterface = true;

    for (let i = 0; i < pinFields.length; i++) {
      if (pinFields[i].name == "pin" || pinFields[i].name == "repeat-pin") {
        pinFields[i].addEventListener("input", function (e) {
          if ((pinFields.item(0)!.value.length == 6) && (pinFields.item(0)!.value === pinFields.item(1)!.value)) {
            button?.removeAttribute("disabled");
            pin = pinFields.item(0)!.value;
          } else {
            button?.setAttribute("disabled", "disabled");
          }
          e.preventDefault();
        });
      }
    }

    button!.addEventListener("click", function (e) {
      let initData = Utils.createInitializationData(pin);
      ipcRenderer.send("initialization-data-submitted", initData);
      e.preventDefault();
    });
  }

  export function renderInitInfoLayout(el: HTMLElement, mess: string): void {
    initializationContainer?.classList.add("keycard__card-info-container-hidden");
    initializationContainer?.classList.remove("keycard__pairing-container");
    initializationDataContainer?.classList.add("keycard__init-info-container");
    initializationDataContainer?.classList.remove("keycard__card-info-container-hidden");

    initializationDataContainer?.append(el);
    el.innerHTML = mess;
    el.classList.add("keycard__pairing-message");
  }

  export function renderInitInfo(initSuccess: boolean, initData: InitializationData): void {
    let successMessage = document.createElement("p");
    let initInfo = document.createElement("div");
    let pin = document.createElement("p");
    let puk = document.createElement("p");
    let pairingSecret = document.createElement("p");

    renderInitInfoLayout(successMessage, "The card has been initialized successfully. Please copy your initialization information.");
    appendInitInfoImg(document.createElement("img"), "./img/smartcard_success.png");
    initializationDataContainer?.append(initInfo);

    initInfo.append(pin);
    initInfo.append(puk);
    initInfo.append(pairingSecret);
    initInfo.classList.add("keycard__init-data-container");

    pin.innerHTML = `<span class="keycard__init-info-label">PIN</span> &emsp;&emsp; ${initData.pin}`;
    puk.innerHTML = `<span class="keycard__init-info-label">PUK</span> &emsp;&emsp; ${initData.puk}`;
    pairingSecret.innerHTML = `<span class="keycard__init-info-label">Pairing Password</span> ${initData.pairingPassword}`;

    pin.classList.add("keycard__init-data");
    puk.classList.add("keycard__init-data");
    pairingSecret.classList.add("keycard__init-data");

    appendInitInfoBtn(document.createElement("input"), "btn-card-init-success");

    document.getElementById("btn-card-init-success")?.addEventListener("click", function (e) {
      clearInitCardInterface();
      e.preventDefault();
    });
  }

  export function renderErrorInitScreen(err: Error): void {
    let errorMessage = document.createElement("p");

    renderInitInfoLayout(errorMessage, err.message + "Please try again.");
    appendInitInfoImg(document.createElement("img"), "./img/smartcard_error.png");
    appendInitInfoBtn(document.createElement("input"), "btn-card-init-error");

    document.getElementById("btn-card-init-error")?.addEventListener("click", function (e) {
      clearInitCardInterface();
      e.preventDefault();
    });
  }

  export function clearInitCardInterface(): void {
    initializationDataContainer!.innerHTML = "";
    initializationContainer?.classList.add("keycard__card-info-container-hidden");
    initializationDataContainer?.classList.add("keycard__card-info-container-hidden");
    initializationContainer?.classList.remove("keycard__pairing-container");
    initializationDataContainer?.classList.remove("keycard__init-info-container");
    mainContainer?.classList.remove("keycard__card-info-container-hidden");
    mainContainer?.classList.add("keycard__main-container");

    let pinFields = document.getElementsByTagName("input");

    for (let i = 0; i < pinFields.length; i++) {
      if (pinFields[i].type != "button") {
        pinFields[i].value = "";
      }
    }
  }

  export function renderAppInfo(appInfo: ShortApplicationInfo): void {
    let header = document.getElementById("app-info-header");
    header!.innerHTML = "Application Info";
    header!.classList.add("keycard__app-info-header");
    header!.classList.remove("keycard__card-info-container-message");
    document.getElementById("instance-uid")!.innerHTML = `<span class="keycard__app-info-label">Instance UID:</span> 0x${appInfo.instanceUID}`;
    document.getElementById("app-version")!.innerHTML = `<span class="keycard__app-info-label">Application Version:</span> ${appInfo.appVersion}`;
    document.getElementById("pairing-slots")!.innerHTML = `<span class="keycard__app-info-label">Free pairing slots:</span> ${appInfo.pairingSlots}`;

    if (appInfo.hasMasterKey) {
      document.getElementById("key-uid")!.innerHTML = `<span class="keycard__app-info-label">Key UID:</span> ${appInfo.keyUID}`;
    } else {
      document.getElementById("key-uid")!.innerHTML = `<span class="keycard__app-info-label">Key UID:</span> The card has no master key`;
    }
  }
}

