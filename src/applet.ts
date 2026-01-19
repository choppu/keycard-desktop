import { AppletInstallOpts } from "./card";
import { UI } from "./ui";
import { ipcRenderer } from "electron";

export namespace InstallApplet {
  export function install(): void {
    let filePath: string | undefined;
    let capFile: ArrayBuffer;
    const fileField = document.getElementById("cap-file") as HTMLInputElement;
    const fileLabel = document.getElementById("file-path-label");
    const installWallet = document.getElementById("install-wallet-applet") as HTMLInputElement;
    const installCash = document.getElementById("install-cash-applet") as HTMLInputElement;
    const installNDEF = document.getElementById("install-ndef-applet") as HTMLInputElement;
    const installIdentApplet = document.getElementById("install-ident-applet") as HTMLInputElement;
    const submitBtn = document.getElementById("reinstall-btn") as HTMLInputElement;
    const cancelBtn = document.getElementById("reinstall-cancel") as HTMLInputElement;

    fileField!.addEventListener("change", async (e) => {
      const target = e.target as HTMLInputElement;
      if(target.files) {
        capFile = await target.files[0].arrayBuffer();
        filePath = target.files[0].name;
      }
     
      fileLabel!.innerHTML = filePath ? filePath : "No file selected";
      filePath ? submitBtn.removeAttribute("disabled") : submitBtn.setAttribute("disabled", "disabled");
      e.preventDefault();
    });

    submitBtn.addEventListener("click", (e) => {
      const installationOptions = {
        installWallet: installWallet.checked, 
        installCash: installCash.checked, 
        installNDEF: installNDEF.checked,
        installIdentApplet: installIdentApplet.checked
      } as AppletInstallOpts;

      ipcRenderer.send('install-applet', capFile, installationOptions);
      UI.unloadFragment();
      UI.loadFragment("waiting.html", () => {
        document.getElementById("waiting-message")!.innerHTML = "Installation is in progress";
      });
      e.preventDefault();
    });

    cancelBtn?.addEventListener("click", (e) => {
      UI.unloadFragment();
      e.preventDefault;
    });
  }

  export function updateProgressMessage(msg: string): void {
    document.getElementById("waiting-message")!.innerHTML = msg;
  }
}