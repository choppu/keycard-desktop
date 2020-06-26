import { ApplicationInfo } from "keycard-sdk/dist/application-info";
import { Utils } from "./utils";

export class  ShortApplicationInfo {
  instanceUID: string;
  appVersion: string;
  pairingSlots: string;
  keyUID: string;
  hasMasterKey: boolean;
  
  constructor(appInfo: ApplicationInfo) {
    this.instanceUID = Utils.hx(appInfo.instanceUID);
    this.appVersion = appInfo.getAppVersionString();
    this.pairingSlots = appInfo.freePairingSlots.toString();
    this.keyUID = Utils.hx(appInfo.keyUID);
    this.hasMasterKey = appInfo.hasMasterKey();
  }
}