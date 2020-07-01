import { UI, cardInfo } from "./ui";
import { Utils } from "./utils";
import { ipcRenderer } from "electron";

export namespace PUK {
  export function verifyPUK() : void {
    let verifyPUKInputs = document.getElementsByClassName("keycard__verify-puk-el");
    let puk = document.getElementById("verify-puk-inp") as HTMLInputElement;
    let newPIN = document.getElementById("new-pin") as HTMLInputElement;
    let repeatPIN = document.getElementById("repeat-new-pin") as HTMLInputElement;
    let submitBtn = document.getElementById("verify-puk-btn") as HTMLInputElement;
    let cancelBtn = document.getElementById("verify-puk-cancel");
    let pukRetryMess = document.getElementById("puk-retry-form");

    pukRetryMess!.innerHTML = `${cardInfo.pukRetry}`;

    for(let i = 0; i < verifyPUKInputs.length; i++) {
      verifyPUKInputs[i] as HTMLInputElement;
      verifyPUKInputs[i].addEventListener("input", (e) => {
        if(Utils.checkInputNumericValue(puk.value, 12) && Utils.checkInputNumericValue(newPIN.value, 6) && Utils.checkInputNumericValue(repeatPIN.value, 6) && (newPIN.value == repeatPIN.value)) {
          submitBtn.removeAttribute("disabled");
        } else {
          submitBtn.setAttribute("disabled", "disabled");
        }
        e.preventDefault();
      });
    }

    submitBtn?.addEventListener("click", (e) => {
      ipcRenderer.send("verify-puk", puk.value, newPIN.value);
      UI.unloadFragment();
      e.preventDefault();
    });

    cancelBtn?.addEventListener("click", (e) => {
      puk.value = "";
      newPIN.value = "";
      repeatPIN.value = "";
      UI.unloadFragment();
      e.preventDefault;
    });
  }

  export function changePUK() : void {
    let newPUK = document.getElementById("change-puk") as HTMLInputElement;
    let repeatNewPUK = document.getElementById("repeat-change-puk") as HTMLInputElement;
    let pukInputs = document.getElementsByClassName("keycard__change-puk-el");
    let submitBtn = document.getElementById("change-puk-btn") as HTMLInputElement;
    let cancelBtn = document.getElementById("change-puk-cancel");

    for(let i = 0; i < pukInputs.length; i++) {
      pukInputs[i] as HTMLInputElement;
      pukInputs[i].addEventListener("input", (e) => {
        (Utils.checkInputNumericValue(newPUK.value, 12) && Utils.checkInputNumericValue(repeatNewPUK.value, 12) && (newPUK.value == repeatNewPUK.value)) ? submitBtn.removeAttribute("disabled") : submitBtn.setAttribute("disabled", "disabled");
        e.preventDefault;
      });
    }

    submitBtn?.addEventListener("click", (e) => {
      ipcRenderer.send("change-puk", newPUK.value);
      UI.unloadFragment();
      e.preventDefault();
    });

    cancelBtn?.addEventListener("click", (e) => {
      newPUK.value = "";
      repeatNewPUK.value = "";
      UI.unloadFragment();
      e.preventDefault;
    });
  }
}