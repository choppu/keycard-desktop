import { ipcRenderer } from "electron";
import { UI } from "./ui";

export namespace FactoryReset {
    export function reset(): void {
      const submitBtn = document.getElementById("reset-card-btn") as HTMLInputElement;
      const cancelBtn = document.getElementById("reset-card-cancel") as HTMLInputElement;
      submitBtn.addEventListener("click", (e) => {
        ipcRenderer.send("factory-reset");
        UI.unloadFragment();
        e.preventDefault();
      });

      cancelBtn.addEventListener("click", (e) => {
        UI.unloadFragment();
        e.preventDefault;
      });
    }
}