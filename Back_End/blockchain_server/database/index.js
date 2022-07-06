const BlockChain = require("cakebase")("./database/blockchain.json");
const VPool = require("cakebase")("./database/vpool.json");
const fs = require("fs");

class DB {
  async getblockChain() {
    const data = await BlockChain.get((i) => true);
    return data;
  }
  async getVPool() {
    const data = await VPool.get((i) => true);
    return data;
  }

  async pushBlock(block) {
    await BlockChain.set(block);
  }

  async replaceChain(chain) {
    fs.writeFileSync("./database/blockchain.json", "");

    for (const block of chain) {
      await this.pushBlock(block);
    }
  }

  async pushVoting(voting) {
    await VPool.set(voting);
  }
}
module.exports = DB;
