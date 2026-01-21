import { ipcRenderer } from "electron";
import { UI } from "./ui";

export namespace LockCard {
    export function lock(): void {
      const submitBtn = document.getElementById("lock-card-btn") as HTMLInputElement;
      const cancelBtn = document.getElementById("lock-card-cancel") as HTMLInputElement;
      submitBtn.addEventListener("click", (e) => {
        ipcRenderer.send("lock-card");
        UI.unloadFragment();
        e.preventDefault();
      });

      cancelBtn.addEventListener("click", (e) => {
        UI.unloadFragment();
        e.preventDefault;
      });
    }
}