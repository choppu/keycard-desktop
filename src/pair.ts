import { ipcRenderer } from "electron";
import { UI } from "./ui";

export namespace Pair {
  export function pair() : void {
    let pairingField = document.getElementById("pairing") as HTMLInputElement;
    let button = document.getElementById("pair-btn");

    button!.addEventListener("click", function (e) {
      ipcRenderer.send("pairing-pass-submitted", pairingField.value);
      UI.unloadFragment();
      e.preventDefault();
    });
  }

  export function changePairingPassword() : void {
    let newPairing = document.getElementById("change-pairing-password") as HTMLInputElement;
    let repeatNewPairing = document.getElementById("repeat-change-pairing-password") as HTMLInputElement;
    let pairingInputs = document.getElementsByClassName("keycard__change-pairing-el");
    let submitBtn = document.getElementById("change-pairing-password-btn") as HTMLInputElement;
    let cancelBtn = document.getElementById("change-pairing-password-cancel");

    for(let i = 0; i < pairingInputs.length; i++) {
      pairingInputs[i] as HTMLInputElement;
      pairingInputs[i].addEventListener("input", (e) => {
        ((newPairing.value.length == repeatNewPairing.value.length) && (newPairing.value == repeatNewPairing.value)) ? submitBtn.removeAttribute("disabled") : submitBtn.setAttribute("disabled", "disabled");
        e.preventDefault();
      });
    }

    submitBtn?.addEventListener("click", (e) => {
      ipcRenderer.send("change-pairing-password", newPairing.value);
      UI.unloadFragment();
      e.preventDefault();
    });

    cancelBtn?.addEventListener("click", (e) => {
      newPairing.value = "";
      repeatNewPairing.value = "";
      UI.unloadFragment();
      e.preventDefault;
    });
  }

  function confirmUnpair(messContainer: HTMLElement, message: string, channel: string, btn: HTMLInputElement, cancelBtn: HTMLInputElement) : void {
    messContainer.innerHTML = message;
    btn.addEventListener("click", (e) => {
      ipcRenderer.send(channel);
      UI.unloadFragment();
      e.preventDefault();
    });

    cancelBtn.addEventListener("click", (e) => {
      UI.unloadFragment();
      e.preventDefault();
    });
  }

  export function unpair() : void {
    let messContainer = document.getElementById("unpair-text");
    let submitBtn = document.getElementById("unpair-btn") as HTMLInputElement;
    let cancelBtn = document.getElementById("unpair-cancel") as HTMLInputElement;
    let message = "unpair your card";

    confirmUnpair(messContainer!, message, 'unpair', submitBtn, cancelBtn);
  }

  export function unpairOtherClients() : void {
    let messContainer = document.getElementById("unpair-text");
    let submitBtn = document.getElementById("unpair-btn") as HTMLInputElement;
    let cancelBtn = document.getElementById("unpair-cancel") as HTMLInputElement;
    let message = "unpair other clients";

    confirmUnpair(messContainer!, message, 'unpair-others', submitBtn, cancelBtn);
  }
}