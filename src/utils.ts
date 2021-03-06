import { InitializationData } from "./initialization-data";

const cryptoRandomString = require('crypto-random-string');

export namespace Utils {
  export function hx(arr: Uint8Array): string {
    return Buffer.from(arr).toString('hex');
  }

  export function createInitializationData(pin: string): InitializationData {
    let puk = cryptoRandomString({ length: 12, type: 'numeric' });;
    let pairingPassword = cryptoRandomString({ length: 8, type: 'url-safe' });
    return new InitializationData(pin, puk, pairingPassword);
  }

  export function checkInputNumericValue(value: string, len: number) : boolean {
    if(value.length == len) {
      return value.split("").every((c) => '0123456789'.includes(c));
    }

    return false;
  }
}