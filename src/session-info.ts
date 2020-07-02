import { ApplicationInfo } from "keycard-sdk/dist/application-info";
import { Utils } from "./utils";
import { ApplicationStatus } from "keycard-sdk/dist/application-status";

export class  SessionInfo {
  cashAddress!: string;
  instanceUID!: string;
  appVersion!: string;
  pairingSlots!: string;
  keyUID!: string;
  keyPath!: string;
  pinRetry!: number | string;
  pukRetry!: number | string;
  hasMasterKey!: boolean;
  secureChannelOpened!: boolean;
  pinVerified!: boolean;
  cardConnected!: boolean;
  
  constructor() {  
    this.reset();
  }

  setApplicationInfo(appInfo: ApplicationInfo) {
    this.instanceUID = Utils.hx(appInfo.instanceUID);
    this.appVersion = appInfo.getAppVersionString();
    this.pairingSlots = appInfo.freePairingSlots.toString();
    this.keyUID = Utils.hx(appInfo.keyUID);
    this.hasMasterKey = appInfo.hasMasterKey();
  }

  setApplicationStatus(appStatus: ApplicationStatus) {
    this.pinRetry = appStatus.pinRetryCount;
    this.pukRetry = appStatus.pukRetryCount;
  }

  reset() {
    this.cashAddress = "";
    this.instanceUID = "";
    this.appVersion = "";
    this.pairingSlots = "";
    this.keyUID = "";
    this.pinRetry = "No data available";
    this.pukRetry = "No data available";
    this.keyPath = "";
    this.hasMasterKey = false;
    this.secureChannelOpened = false;
    this.pinVerified = false;
    this.cardConnected = false;
  }
}