export class InitializationData {
  pin: string;
  puk: string;
  pairingPassword: string;

  constructor(pin: string, puk: string, pairingPassword: string) {
    this.pin = pin;
    this.puk = puk;
    this.pairingPassword = pairingPassword;
  }
}