const ChainFun = require("../chain-fun.js");
const Config = require("../config.js");
const config = Config.GetConfig();

const DIFFICULTY = config.DIFFICULTY;
const MINE_RATE = config.MINE_RATE;

class Block {
  constructor(timestamp, lastHash, hash, data, nonce, difficulty) {
    this.timestamp = timestamp;
    this.lastHash = lastHash;
    this.hash = hash;
    this.data = data;
    this.nonce = nonce;
    this.difficulty = difficulty || DIFFICULTY;
  }

  toString() {
    return `Block-
    Time-Stamp : ${this.timestamp}
    Last-Hash  : ${this.lastHash.substring(0, 7)}
    Hash       : ${this.hash.substring(0, 7)}
    Nonce      : ${this.nonce}
    Difficulty : ${this.difficulty}
    Data       : ${this.data}`;
  }

  static genesis() {
    return new this("Genesis Time", "null", "First Hash", [], 0, DIFFICULTY);
  }

  static adjustDifficulty(lastBlock, currentTime) {
    let { difficulty } = lastBlock;
    difficulty =
      lastBlock.timestamp + MINE_RATE > currentTime
        ? difficulty + 1
        : difficulty - 1;

    return difficulty;
  }

  static mine(lastBlock, data) {
    let hash,
      timestamp,
      nonce = 0;

    const lastHash = lastBlock.hash;
    let { difficulty } = lastBlock;

    do {
      nonce++;
      timestamp = Date.now();
      difficulty = Block.adjustDifficulty(lastBlock, timestamp);
      hash = ChainFun.genBlockHash({
        timestamp,
        lastHash,
        data,
        nonce,
        difficulty,
      });
    } while (hash.substring(0, difficulty) !== "0".repeat(difficulty));

    return new this(timestamp, lastHash, hash, data, nonce, difficulty);
  }
}
module.exports = Block;
