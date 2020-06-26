import { Utils } from "./utils";

const { ipcRenderer } = require('electron');

export namespace Initialization {
  export function initializeCard(): void {
    document.addEventListener('DOMContentLoaded', function () {
      let pinFields = document.getElementsByTagName("input");
    let button = document.getElementById("initialize-btn");
    let pin: string;
  
    for (let i = 0; i < pinFields.length; i++) {
      console.log("hello");
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
    });
  }
}

console.log("hello");

Initialization.initializeCard();


