import { ipcRenderer } from "electron";
import { UI } from "./ui";

export namespace Pair {
  export function pair(): void {
    let pairingField = document.getElementById("pairing") as HTMLInputElement;
    let button = document.getElementById("pair-btn");

    button!.addEventListener("click", function (e) {
      ipcRenderer.send("pairing-pass-submitted", pairingField.value);
      UI.unloadFragment();
      e.preventDefault();
    });
  }

}