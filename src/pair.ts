import { ipcRenderer } from "electron";
import { UI } from "./ui";

export namespace Pair {
  export function pair(): void {
    let pairingField = document.getElementById("pairing") as HTMLInputElement;
    let button = document.getElementById("pair-btn");
    let pairing: string;

    button!.addEventListener("click", function (e) {
      pairing = pairingField.value;
      ipcRenderer.send("pairing-pass-submitted", pairing);
      UI.unloadFragment();
      e.preventDefault();
    });
  }

}