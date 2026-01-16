import { ipcRenderer } from "electron";
import { UI } from "./ui";

export namespace Pair {
  export function pair() : void {
    const pairingField = document.getElementById("pairing") as HTMLInputElement;
    const btn = document.getElementById("pair-btn") as HTMLInputElement;
    const cancelBtn = document.getElementById("pair-cancel-btn") as HTMLInputElement;

    btn.addEventListener("click", function (e) {
      ipcRenderer.send("pairing-pass-submitted", pairingField.value);
      UI.unloadFragment();
      e.preventDefault();
    });

    cancelBtn.addEventListener("click", (e) => {
      ipcRenderer.send("pairing-pass-submitted", null);
      UI.unloadFragment();
      e.preventDefault();
    });
  }

  export function changePairingPassword() : void {
    const newPairing = document.getElementById("change-pairing-password") as HTMLInputElement;
    const repeatNewPairing = document.getElementById("repeat-change-pairing-password") as HTMLInputElement;
    const pairingInputs = document.getElementsByClassName("keycard__change-pairing-el");
    const submitBtn = document.getElementById("change-pairing-password-btn") as HTMLButtonElement;
    const cancelBtn = document.getElementById("change-pairing-password-cancel") as HTMLButtonElement;

    for(let i = 0; i < pairingInputs.length; i++) {
      pairingInputs[i] as HTMLInputElement;
      pairingInputs[i].addEventListener("input", (e) => {
        ((newPairing.value.length == repeatNewPairing.value.length) && (newPairing.value === repeatNewPairing.value)) ? submitBtn.removeAttribute("disabled") : submitBtn.setAttribute("disabled", "disabled");
        e.preventDefault();
      });
    }

    submitBtn.addEventListener("click", (e) => {
      ipcRenderer.send("change-pairing-password", newPairing.value);
      UI.unloadFragment();
      e.preventDefault();
    });

    cancelBtn.addEventListener("click", (e) => {
      newPairing.value = "";
      repeatNewPairing.value = "";
      UI.unloadFragment();
      e.preventDefault;
    });
  }

  function confirmUnpair(msgContainer: HTMLElement, message: string, channel: string, btn: HTMLInputElement, cancelBtn: HTMLInputElement) : void {
    msgContainer.innerHTML = message;
    
    btn.addEventListener("click", (e) => {
      ipcRenderer.send(channel);
      UI.unloadFragment();
      UI.loadFragment("waiting.html", () => {
        document.getElementById("waiting-message")!.innerHTML = "Unpairing. Please don't disconnect your card.";
      });
      e.preventDefault();
    });

    cancelBtn.addEventListener("click", (e) => {
      UI.unloadFragment();
      e.preventDefault();
    });
  }

  export function unpair() : void {
    const msgContainer = document.getElementById("unpair-text") as HTMLSpanElement;
    const submitBtn = document.getElementById("unpair-btn") as HTMLInputElement;
    const cancelBtn = document.getElementById("unpair-cancel") as HTMLInputElement;
    const message = "unpair your card";

    confirmUnpair(msgContainer, message, 'unpair', submitBtn, cancelBtn);
  }

  export function unpairOtherClients() : void {
    const msgContainer = document.getElementById("unpair-text") as HTMLSpanElement;
    const submitBtn = document.getElementById("unpair-btn") as HTMLInputElement;
    const cancelBtn = document.getElementById("unpair-cancel") as HTMLInputElement;
    const  message = "unpair other clients";

    confirmUnpair(msgContainer, message, 'unpair-others', submitBtn, cancelBtn);
  }
}