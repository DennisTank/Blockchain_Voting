const EC = require("elliptic").ec;
const { v1: uuidV1 } = require("uuid");
const SHA256 = require("crypto-js/sha256");

// install all the above
const ec = new EC("secp256k1");

class ChainFun {
  // static genKeyPair() {
  //   return ec.genKeyPair();
  // }
  // Secret -> keyPair

  static genID() {
    return uuidV1();
  }

  static genBlockHash(block) {
    const { timestamp, lastHash, data, nonce, difficulty } = block;
    return SHA256(
      `${timestamp}${lastHash}${data}${nonce}${difficulty}`
    ).toString();
  }

  static genHash(data) {
    return SHA256(JSON.stringify(data)).toString();
  }

  static verifySignature(publicKey, signature, dataHash) {
    return ec.keyFromPublic(publicKey, "hex").verify(dataHash, signature);
  }
}
module.exports = ChainFun;
