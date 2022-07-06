const ChainFun = require("../chain-fun.js");
const Block = require("./block.js");
const DB = require("../database");
class BlockChain {
  constructor() {
    this.db = new DB();
    this.chain = [];
  }
  async loadData() {
    const data = await this.db.getblockChain();
    if (data.length === 0) {
      this.chain.push(Block.genesis());
      await this.db.pushBlock(Block.genesis());
    } else {
      this.chain = [...data];
    }
  }

  async addBlock(data) {
    const block = Block.mine(this.chain[this.chain.length - 1], data);
    this.chain.push(block);
    await this.db.pushBlock(block);
    return block;
  }

  static isValid(chain) {
    if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis()))
      return false;

    for (let i = 1; i < chain.length; i++) {
      const block = chain[i];
      const lastBlock = chain[i - 1];
      const blockHash = ChainFun.genBlockHash(block);

      if (block.lastHash !== lastBlock.hash || block.hash !== blockHash)
        return false;
    }

    return true;
  }

  async replaceChain(newChain) {
    if (newChain.length <= this.chain.length) {
      console.log("Recived chain is not longer than the current chain.");
      return;
    } else if (!BlockChain.isValid(newChain)) {
      console.log("Recived chain is not valid.");
      return;
    }
    console.log("Replacing Block-Chain.");
    this.chain = newChain;
    await this.db.replaceChain(newChain);
  }

  getVotes(voteID) {
    const arr = [];
    this.chain.forEach((block) => {
      block.data.forEach((transaction) => {
        if (transaction.vote.id === voteID) arr.push(transaction.vote);
      });
    });
    return arr;
  }

  existingVote(vote) {
    let exist = false;
    this.chain.forEach((block) => {
      block.data.forEach((transaction) => {
        if (
          vote.id === transaction.vote.id &&
          vote.address === transaction.vote.address
        ) {
          exist = true;
        }
      });
    });
    return exist;
  }
}
module.exports = BlockChain;
