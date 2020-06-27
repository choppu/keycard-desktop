import { ApplicationInfo } from "keycard-sdk/dist/application-info";
import { Utils } from "./utils";
import { ApplicationStatus } from "keycard-sdk/dist/application-status";

export class  ShortApplicationInfo {
  instanceUID: string;
  appVersion: string;
  pairingSlots: string;
  keyUID: string;
  pinRetry: number;
  pukRetry: number
  hasMasterKey: boolean;
  
  constructor(appInfo: ApplicationInfo, status: ApplicationStatus) {
    this.instanceUID = Utils.hx(appInfo.instanceUID);
    this.appVersion = appInfo.getAppVersionString();
    this.pairingSlots = appInfo.freePairingSlots.toString();
    this.keyUID = Utils.hx(appInfo.keyUID);
    this.pinRetry = status.pinRetryCount;
    this.pukRetry = status.pukRetryCount;
    this.hasMasterKey = appInfo.hasMasterKey();
  }
}