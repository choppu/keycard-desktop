import { UI, cardInfo } from "./ui";
import { Utils } from "./utils";
import { ipcRenderer } from "electron";

export namespace PIN {
  export function verifyPIN() : void {
    let pin = document.getElementById("verify-pin-inp") as HTMLInputElement;
    let submitBtn = document.getElementById("verify-pin-btn") as HTMLInputElement;
    let cancelBtn = document.getElementById("verify-pin-cancel") as HTMLInputElement;
    let pinRetryMessage = document.getElementById("pin-retry-form") as HTMLSpanElement;

    pinRetryMessage.innerHTML = `${cardInfo.pinRetry}`;

    pin.addEventListener("input", (e) => {
      (Utils.checkLength(pin.value, 6)) ? submitBtn.removeAttribute("disabled") : submitBtn.setAttribute("disabled", "disabled");
      e.preventDefault();
    });

    submitBtn.addEventListener("click", (e) => {
      ipcRenderer.send("verify-pin", pin.value);
      UI.unloadFragment();
      e.preventDefault();
    });

    cancelBtn.addEventListener("click", (e) => {
      pin.value = "";
      UI.unloadFragment();
      e.preventDefault;
    });
  }

  export function changePIN() : void {
    const newPIN = document.getElementById("change-pin") as HTMLInputElement;
    const repeatNewPIN = document.getElementById("repeat-change-pin") as HTMLInputElement;
    const pinInputs = document.getElementsByClassName("keycard__change-pin-el") as HTMLCollectionOf<HTMLInputElement>;
    const submitBtn = document.getElementById("change-pin-btn") as HTMLInputElement;
    const cancelBtn = document.getElementById("change-pin-cancel") as HTMLInputElement;

    for(let i = 0; i < pinInputs.length; i++) {
      pinInputs[i].addEventListener("input", (e) => {
        (Utils.isValueMatch(newPIN.value, repeatNewPIN.value, 6)) ? submitBtn.removeAttribute("disabled") : submitBtn.setAttribute("disabled", "disabled");
        e.preventDefault();
      });
    }

    submitBtn.addEventListener("click", (e) => {
      ipcRenderer.send("change-pin", newPIN.value);
      UI.unloadFragment();
      e.preventDefault();
    });

    cancelBtn.addEventListener("click", (e) => {
      newPIN.value = "";
      repeatNewPIN.value = "";
      UI.unloadFragment();
      e.preventDefault;
    });
  }
}

