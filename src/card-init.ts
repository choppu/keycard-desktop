import { UI } from "./ui";
import { InitializationData } from "./initialization-data";
import { ipcRenderer } from "electron";
import { Utils } from "./utils";

export namespace CardInit {
  export function initializeCard(): void {
    let pinFields = document.getElementsByTagName("input");
    let button = document.getElementById("initialize-btn");
    let pin: string;

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

  export function renderInitInfo(initData: InitializationData): void {
    UI.loadFragment('initialization-success.html', () => {
      let pin = document.getElementById("pin");
      let puk = document.getElementById("puk");
      let pairingPassword = document.getElementById("pairing-password");
  
      pin!.innerHTML = initData.pin;
      puk!.innerHTML = initData.puk;
      pairingPassword!.innerHTML = initData.pairingPassword;
  
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