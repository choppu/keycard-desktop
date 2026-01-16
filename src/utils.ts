import { InitializationData } from "./initialization-data";
import cryptoRandomString from 'crypto-random-string';

export namespace Utils {
  export function hx(arr: Uint8Array): string {
    return Buffer.from(arr).toString('hex');
  }

  export function createInitializationData(pin: string): InitializationData {
    let puk = cryptoRandomString({ length: 12, type: 'numeric' });;
    let pairingPassword = cryptoRandomString({ length: 8, type: 'url-safe' });
    return new InitializationData(pin, puk, pairingPassword);
  }

  export function isValueMatch(val1: string, val2: string, len: number) : boolean {
    const val1Num = checkLength(val1, len);
    const val2Num = checkLength(val2, len);
    return (val1Num && val2Num) ? (val1 === val2) : false;
  } 

  export function checkLength(val: string, len: number) : number | null {
    return ((val.length == len) && !isNaN(Number(val))) ? Number(val) : null;
  }
}