const VoteTransaction = require("./vote-transaction.js");

class VoteTransactionPool {
  constructor() {
    this.pool = [];
  }
  existingVote(voteID, address) {
    return this.pool.find((vt) => {
      if (vt.vote.id === voteID && vt.vote.address === address) {
        console.log(`Cannot add existing vote in VOTING ID:${voteID}`);
        return vt;
      }
    });
  }
  addVoteTransaction(votingPool, vote) {
    //validate and create a new VoteTransaction
    const voteTransaction = VoteTransaction.newVoteTransaction(
      votingPool,
      vote
    );
    const existing = this.existingVote(vote.id, vote.address);
    //if valid and not exist
    if (voteTransaction && !existing) {
      this.pool.push(voteTransaction);
      console.log(`New Vote Added in VOTING ID:${vote.id}`);

      return { success: true, voteTransaction };
    }
    return { success: false };
  }
  addPrebuildVT(voteTransaction) {
    const id = this.pool.find((vt) => vt.id === voteTransaction.id);
    if (id) {
      this.pool[this.pool.indexOf(id)] = voteTransaction;
    } else {
      this.pool.push(voteTransaction);
      console.log(`New Vote Added in VOTING ID:${voteTransaction.vote.id}`);
    }
  }

  validVotes(votingPool) {
    return this.pool.filter((vt) => {
      if (votingPool.validate(vt.vote.id, vt.vote.address)) {
        return vt;
      }
    });
  }

  clear() {
    this.pool = [];
  }
}
module.exports = VoteTransactionPool;
