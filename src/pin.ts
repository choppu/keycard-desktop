import { UI } from "./ui";
import { Utils } from "./utils";
import { ipcRenderer } from "electron";
import { cardInfo } from "./renderer";
import { PUK } from "./puk";

export namespace PIN {
  export function verifyPIN() : void {
    let pin = document.getElementById("verify-pin-inp") as HTMLInputElement;
    let submitBtn = document.getElementById("verify-pin-btn") as HTMLInputElement;
    let cancelBtn = document.getElementById("verify-pin-cancel");

    pin.addEventListener("input", (e) => {
      Utils.checkInputNumericValue(pin.value, 6) ? submitBtn.removeAttribute("disabled") : submitBtn.setAttribute("disabled", "disabled");
    })

    submitBtn?.addEventListener("click", (e) => {
      ipcRenderer.send("verify-pin", pin.value);
      e.preventDefault();
    });

    cancelBtn?.addEventListener("click", (e) => {
      pin.value = "";
      UI.unloadFragment();
      e.preventDefault;
    });
  }

  export function changePIN() : void {

  }
}

