import { ipcRenderer } from "electron";
import { UI } from "./ui";

export namespace Key {
  export function createMnemonic() : void {
    ipcRenderer.send("create-mnemonic");
  }

  export function renderMnemonicWordlist(wordList: string) : void {
    let wordListContainer = document.getElementById("wordlist-container");
    let btn = document.getElementById("wordlist-ok") as HTMLInputElement;

    wordListContainer!.innerHTML = wordList;

    btn!.addEventListener("click", (e) => {
      UI.unloadFragment();
      e.preventDefault();
    });
  }

  export function loadMnemonic() : void {

  }

  export function removeKey() : void {
    let submitBtn = document.getElementById("remove-btn") as HTMLInputElement;
    let cancelBtn = document.getElementById("remove-cancel") as HTMLInputElement;

    submitBtn.addEventListener("click", (e) => {
      ipcRenderer.send('remove-key');
      UI.unloadFragment();
      e.preventDefault();
    });

    cancelBtn.addEventListener("click", (e) => {
      UI.unloadFragment();
      e.preventDefault();
    });
  }
}