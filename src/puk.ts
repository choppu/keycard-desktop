import { UI, cardInfo } from "./ui";
import { Utils } from "./utils";
import { ipcRenderer } from "electron";

export namespace PUK {
  export function verifyPUK() : void {
    const verifyPUKInputs = document.getElementsByClassName("keycard__verify-puk-el") as HTMLCollectionOf<HTMLInputElement>;
    const puk = document.getElementById("verify-puk-inp") as HTMLInputElement;
    const newPIN = document.getElementById("new-pin") as HTMLInputElement;
    const repeatPIN = document.getElementById("repeat-new-pin") as HTMLInputElement;
    const submitBtn = document.getElementById("verify-puk-btn") as HTMLInputElement;
    const cancelBtn = document.getElementById("verify-puk-cancel") as HTMLInputElement;
    const pukRetryMess = document.getElementById("puk-retry-form") as HTMLInputElement;

    pukRetryMess!.innerHTML = `${cardInfo.pukRetry}`;

    for(let i = 0; i < verifyPUKInputs.length; i++) {
      verifyPUKInputs[i].addEventListener("input", (e) => {
        if(Utils.checkLength(puk.value, 12) && Utils.isValueMatch(newPIN.value, repeatPIN.value, 6)) {
          submitBtn.removeAttribute("disabled");
        } else {
          submitBtn.setAttribute("disabled", "disabled");
        }
        e.preventDefault();
      });
    }

    submitBtn.addEventListener("click", (e) => {
      ipcRenderer.send("verify-puk", puk.value, newPIN.value);
      UI.unloadFragment();
      e.preventDefault();
    });

    cancelBtn.addEventListener("click", (e) => {
      puk.value = "";
      newPIN.value = "";
      repeatPIN.value = "";
      UI.unloadFragment();
      e.preventDefault;
    });
  }

  export function changePUK() : void {
    const newPUK = document.getElementById("change-puk") as HTMLInputElement;
    const repeatNewPUK = document.getElementById("repeat-change-puk") as HTMLInputElement;
    const pukInputs = document.getElementsByClassName("keycard__change-puk-el") as HTMLCollectionOf<HTMLInputElement>;
    const submitBtn = document.getElementById("change-puk-btn") as HTMLInputElement;
    const cancelBtn = document.getElementById("change-puk-cancel") as HTMLInputElement;

    for(let i = 0; i < pukInputs.length; i++) {
      pukInputs[i].addEventListener("input", (e) => {
        (Utils.isValueMatch(newPUK.value, repeatNewPUK.value, 12)) ? submitBtn.removeAttribute("disabled") : submitBtn.setAttribute("disabled", "disabled");
        e.preventDefault;
      });
    }

    submitBtn.addEventListener("click", (e) => {
      ipcRenderer.send("change-puk", newPUK.value);
      UI.unloadFragment();
      e.preventDefault();
    });

    cancelBtn.addEventListener("click", (e) => {
      newPUK.value = "";
      repeatNewPUK.value = "";
      UI.unloadFragment();
      e.preventDefault;
    });
  }
}