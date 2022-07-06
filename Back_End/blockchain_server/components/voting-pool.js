/*
[
  single voting obj
  {
  id:
  participants:[list of address]
  },
  ..
]
*/
const DB = require("../database");
class VotingPool {
  constructor() {
    this.db = new DB();
    this.pool = [];
  }
  async loadData() {
    const data = await this.db.getVPool();
    this.pool = data;
  }

  async addVoting(voting) {
    const existing = this.pool.find((v) => v.id === voting.id);
    if (existing) {
      console.log(`Voting ID:${voting.id} already exists.`);
      return { success: false };
    }

    this.pool.push(voting);
    await this.db.pushVoting(voting);

    console.log(`New Vote ID:${voting.id} is added`);
    return { success: true };
  }

  async addPrebuildVoting(voting) {
    const id = this.pool.find((v) => v.id === voting.id);
    if (id) {
      this.pool[this.pool.indexOf(id)] = voting;
    } else {
      this.pool.push(voting);
      await this.db.pushVoting(voting);

      console.log(`New Vote ID:${voting.id} is added`);
    }
  }

  validate(voteID, address) {
    const voting = this.pool.find((v) => v.id === voteID);
    if (!voting) {
      return false;
    }

    const participant = voting.participants.find((p) => p === address);
    if (!participant) {
      return false;
    }

    return true;
  }
}
module.exports = VotingPool;
