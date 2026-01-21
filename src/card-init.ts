import { UI } from "./ui";
import { InitializationData } from "./initialization-data";
import { ipcRenderer } from "electron";
import { Utils } from "./utils";

export namespace CardInit { 
  export function initializeCard(): void {
    const pinFields = document.getElementsByTagName("input");
    const button = document.getElementById("initialize-btn");
    let pin: string;

    for (let i = 0; i < pinFields.length; i++) {
      if (pinFields[i].name == "pin" || pinFields[i].name == "repeat-pin") {
        pinFields[i].addEventListener("input", function (e) {
          if (Utils.isValueMatch(pinFields.item(0)!.value, pinFields.item(1)!.value, 6)) {
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
      const initData = Utils.createInitializationData(pin);
      ipcRenderer.send("initialization-data-submitted", initData);
      e.preventDefault();
    });
  }

  export function renderInitInfo(initData: InitializationData): void {
    UI.loadFragment('initialization-success.html', () => {
      const okBtn = document.getElementById("btn-card-init-success") as HTMLInputElement;
      const pin = document.getElementById("pin") as HTMLSpanElement;
      const duressPIN = document.getElementById("duress-pin") as HTMLSpanElement;
  
      pin.innerHTML = initData.pin;
      duressPIN.innerHTML = initData.puk.substring(0,6);
  
      okBtn.addEventListener("click", function (e) {
        UI.unloadFragment();
        e.preventDefault();
      });
    });
  }
}