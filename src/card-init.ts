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
      const pin = document.getElementById("pin") as HTMLSpanElement;
      const puk = document.getElementById("puk") as HTMLSpanElement;
      const pairingPassword = document.getElementById("pairing-password") as HTMLSpanElement;
  
      pin.innerHTML = initData.pin;
      puk.innerHTML = initData.puk;
      pairingPassword.innerHTML = initData.pairingPassword;
  
      document.getElementById("btn-card-init-success")?.addEventListener("click", function (e) {
        UI.unloadFragment();
        e.preventDefault();
      });
    });
  }

  ipcRenderer.on("card-initialization", (_, initData) => {
    UI.addMessageToLog("Card initialized");
    renderInitInfo(initData);
  });
}