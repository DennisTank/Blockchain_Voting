const keypair = require("stellar-keypair-from-seed");
const Cryptr = require("cryptr");

class CryptoFun {
  static getOriginalSecret(secret) {
    const keys = keypair(secret);

    return `${keys.publicKey()}${secret}${keys.secret()}`;
  }

  static decrypt(originalSecret, cypher) {
    const c = new Cryptr(originalSecret);

    return JSON.parse(c.decrypt(cypher));
  }
}
module.exports = CryptoFun;
