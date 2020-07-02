import { ipcRenderer } from "electron";
import { UI } from "./ui";
import { KeyPath } from "keycard-sdk/dist/key-path";

const bip39 = require('bip39');

export namespace Key {
  const mnemonicLength = 12 | 15 | 18 | 24;
  export function createMnemonic() : void {
    document.getElementById("waiting-message")!.innerHTML = "Creating mnemonic. Please don't disconnect your card.";
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
    let mnemonicPhraseField = document.getElementById("load-mnemonic-inp") as HTMLTextAreaElement;
    let submitBtn = document.getElementById("load-mnemonic-btn") as HTMLInputElement;
    let cancelBtn = document.getElementById("load-mnemonic-cancel") as HTMLInputElement;
    let mnemonic: string;

    mnemonicPhraseField.addEventListener("input", (e) => {
      mnemonic = mnemonicPhraseField.value.trim();
      bip39.validateMnemonic(mnemonic) ? submitBtn.removeAttribute("disabled") : submitBtn.setAttribute("disabled", "disabled");
      e.preventDefault();
    });
  
    submitBtn?.addEventListener("click", (e) => {
      ipcRenderer.send("load-mnemonic", mnemonic);
      UI.unloadFragment();
      e.preventDefault();
    });

    cancelBtn?.addEventListener("click", (e) => {
      mnemonicPhraseField.value = "";
      UI.unloadFragment();
      e.preventDefault;
    });

  }

  export function changeWallet() : void {
    let walletPath = document.getElementById("change-wallet-path") as HTMLInputElement;
    let submitBtn = document.getElementById("change-wallet-path-btn") as HTMLInputElement;
    let cancelBtn = document.getElementById("change-wallet-path-cancel") as HTMLInputElement;

    walletPath.addEventListener("input", (e) => {
      if (walletPath.value == "") {
        submitBtn.setAttribute("disabled", "disabled");
        return;
      }

      try {
        new KeyPath(walletPath.value);
        submitBtn.removeAttribute("disabled");
      } catch (error) {
        submitBtn.setAttribute("disabled", "disabled");
      }
    });

    submitBtn.addEventListener("click", (e) => {
      ipcRenderer.send('change-wallet', walletPath.value);
      UI.unloadFragment();
      UI.loadFragment("waiting.html", () => {
        document.getElementById("waiting-message")!.innerHTML = "Updating wallet path. Please don't disconnect your card.";
      });
      e.preventDefault();
    });

    cancelBtn.addEventListener("click", (e) => {
      UI.unloadFragment();
      e.preventDefault();
    });
  }

  export function removeKey() : void {
    let submitBtn = document.getElementById("remove-btn") as HTMLInputElement;
    let cancelBtn = document.getElementById("remove-cancel") as HTMLInputElement;

    submitBtn.addEventListener("click", (e) => {
      ipcRenderer.send('remove-key');
      UI.unloadFragment();
      UI.loadFragment("waiting.html", () => {
        document.getElementById("waiting-message")!.innerHTML = "Removing key. Please don't disconnect your card.";
      });
      e.preventDefault();
    });

    cancelBtn.addEventListener("click", (e) => {
      UI.unloadFragment();
      e.preventDefault();
    });
  }
}