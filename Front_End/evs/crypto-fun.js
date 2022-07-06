const keypair = require("stellar-keypair-from-seed");
const Cryptr = require("cryptr");

class CryptoFun {
  static getPublicKeyOfSecret(secret) {
    const keys = keypair(secret);

    return keys.publicKey();
  }

  static getOriginalSecret(secret) {
    const keys = keypair(secret);

    return `${keys.publicKey()}${secret}${keys.secret()}`;
  }

  static encrypt(originalSecret, data) {
    const c = new Cryptr(originalSecret);

    return c.encrypt(JSON.stringify(data));
  }
}
export default CryptoFun;
