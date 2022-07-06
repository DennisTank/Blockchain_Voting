/*
{
  id:
  vote:{
    id:
    timestamp:
    optionid:
    address:
  }
}
 */
const ChainFun = require("../chain-fun");

class VoteTransaction {
  constructor(vote) {
    this.id = ChainFun.genID();
    this.vote = vote;
  }
  static newVoteTransaction(votingPool, vote) {
    const flag = votingPool.validate(vote.id, vote.address);
    if (!flag) {
      console.log(`Cannot add invalid vote in VOTING ID :${vote.id}`);
      return;
    }
    return new this(vote);
  }
}
module.exports = VoteTransaction;
