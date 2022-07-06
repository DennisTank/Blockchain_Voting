const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const CryptoFun = require("./crypto-fun.js");

class APIServer {
  constructor(blockchain, votingPool, voteTransactionPool, p2p, miner) {
    this.blockchain = blockchain;
    this.votingPool = votingPool;
    this.voteTransactionPool = voteTransactionPool;
    this.p2p = p2p;
    this.miner = miner;
    this.app = express();
  }
  create() {
    this.app.use(bodyParser.json());
    this.app.use(cors());
    /*rountes*/

    //GET

    this.app.get("/blockchain", (req, res) => {
      res.json(this.blockchain.chain);
    });

    this.app.get("/votes", (req, res) => {
      const { voteId } = req.body;
      const votes = this.blockchain.getVotes(voteId);
      res.json(votes);
    });

    //POST

    this.app.post("/voting", async (req, res) => {
      const { voting } = req.body;

      const response = await this.votingPool.addVoting(voting);

      res.json(response);
      // this is for testing,,, use the above one
      // res.json(this.votingPool.pool);

      this.p2p.broadcastVoting(voting);
    });

    this.app.post("/transact-vote", (req, res) => {
      // remove the vote from SECRET
      /*
      em{
        m:"dfssafdas",
        s:seceret
      }
       */
      const em = req.body.em;
      const os = CryptoFun.getOriginalSecret(em.s);
      const vote = CryptoFun.decrypt(os, em.m);

      const response = this.voteTransactionPool.addVoteTransaction(
        this.votingPool,
        vote
      );
      if (response.success === true) {
        res.redirect("mine");
      } else {
        res.json({ success: false });
      }
      //redirect to mine

      if (response.voteTransaction) {
        this.p2p.broadcastVoteTransaction(response.voteTransaction);
      }
    });

    this.app.get("/mine", async (req, res) => {
      const response = await this.miner.mine();
      if (response.m) {
        res.json({ success: false });
        console.log(response.m);
      } else {
        res.json({ success: true });
        console.log(response.toString());
      }
    });
  }
}
module.exports = APIServer;
