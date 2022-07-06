class Miner {
  constructor(blockchain, votingPool, voteTransactionPool, p2p) {
    this.blockchain = blockchain;
    this.votingPool = votingPool;
    this.voteTransactionPool = voteTransactionPool;
    this.p2p = p2p;
  }
  async mine() {
    const validVotes = this.voteTransactionPool.validVotes(this.votingPool);

    const nonExistingVV = validVotes.filter((t) => {
      if (!this.blockchain.existingVote(t.vote)) {
        return t;
      }
    });

    if (nonExistingVV.length === 0) return { m: "Not Votes to Mine!" };

    const block = await this.blockchain.addBlock(nonExistingVV);
    this.p2p.syncChain();
    this.voteTransactionPool.clear();
    this.p2p.broadcastClearTransactionPool();
    return block;
  }
}
module.exports = Miner;
