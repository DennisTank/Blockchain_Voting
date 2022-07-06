const randomWords = require("random-words");
const keypair = require("stellar-keypair-from-seed");
const Cryptr = require("cryptr");

class CryptoFun {
  static createSecret() {
    const list = randomWords(6);
    let secret = "";
    list.forEach((w) => {
      secret += w.toUpperCase() + ".";
    });
    return secret;
  }
  static getPublicKeyOfSecret(secret) {
    const keys = keypair(secret);

    return keys.publicKey();
  }
}
module.exports = CryptoFun;
