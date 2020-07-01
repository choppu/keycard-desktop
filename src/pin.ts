import { UI, cardInfo } from "./ui";
import { Utils } from "./utils";
import { ipcRenderer } from "electron";
import { PUK } from "./puk";

export namespace PIN {
  export function verifyPIN() : void {
    let pin = document.getElementById("verify-pin-inp") as HTMLInputElement;
    let submitBtn = document.getElementById("verify-pin-btn") as HTMLInputElement;
    let cancelBtn = document.getElementById("verify-pin-cancel");
    let pinRetryMess = document.getElementById("pin-retry-form");

    pinRetryMess!.innerHTML = `${cardInfo.pinRetry}`;

    pin.addEventListener("input", (e) => {
      Utils.checkInputNumericValue(pin.value, 6) ? submitBtn.removeAttribute("disabled") : submitBtn.setAttribute("disabled", "disabled");
      e.preventDefault();
    });

    submitBtn?.addEventListener("click", (e) => {
      ipcRenderer.send("verify-pin", pin.value);
      UI.unloadFragment();
      e.preventDefault();
    });

    cancelBtn?.addEventListener("click", (e) => {
      pin.value = "";
      UI.unloadFragment();
      e.preventDefault;
    });
  }

  export function changePIN() : void {
    let newPIN = document.getElementById("change-pin") as HTMLInputElement;
    let repeatNewPIN = document.getElementById("repeat-change-pin") as HTMLInputElement;
    let pinInputs = document.getElementsByClassName("keycard__change-pin-el");
    let submitBtn = document.getElementById("change-pin-btn") as HTMLInputElement;
    let cancelBtn = document.getElementById("change-pin-cancel");

    for(let i = 0; i < pinInputs.length; i++) {
      pinInputs[i] as HTMLInputElement;
      pinInputs[i].addEventListener("input", (e) => {
        (Utils.checkInputNumericValue(newPIN.value, 6) && Utils.checkInputNumericValue(repeatNewPIN.value, 6) && (newPIN.value == repeatNewPIN.value)) ? submitBtn.removeAttribute("disabled") : submitBtn.setAttribute("disabled", "disabled");
        e.preventDefault();
      });
    }

    submitBtn?.addEventListener("click", (e) => {
      ipcRenderer.send("change-pin", newPIN.value);
      UI.unloadFragment();
      e.preventDefault();
    });

    cancelBtn?.addEventListener("click", (e) => {
      newPIN.value = "";
      repeatNewPIN.value = "";
      UI.unloadFragment();
      e.preventDefault;
    });
  }
}

